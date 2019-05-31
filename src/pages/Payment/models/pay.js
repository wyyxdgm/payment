import qs from 'qs';
import { submit, detail, installments, openId, getFormInfo, student, kgName } from '@/services/pay';
import { jsonToFormData } from '@/utils/convert';

export default {
  namespace: 'pay',

  state: {
    summary: {
      name: '',
      gradeId: 0,
      formContent: [],
    },
    periods: [],
    students: [],
    kindergartenName: '',
  },

  effects: {
    // 支付提交
    *submit({ payload, callback }, { call, select }) {
      const gradeId = yield select(({ pay }) => pay.summary.gradeId);
      const formData = jsonToFormData({ ...payload, gradeId });
      const response = yield call(submit, formData);
      if (callback) {
        callback(response);
      }
    },

    *openId({ payload, callback }, { call }) {
      const formData = jsonToFormData({ ...payload, kindergartenId: 0 });
      const response = yield call(openId, formData);
      if (callback) {
        callback(response);
      }
    },

    *getFormInfo({ payload, callback }, { call }) {
      const formData = jsonToFormData(payload);
      const response = yield call(getFormInfo, formData);
      if (callback) {
        callback(qs.parse(response));
      }
    },

    // 分期信息
    *detail({ payload }, { all, call, put }) {
      const [detailRes, installmentsRes] = yield all([
        call(detail, { ...payload }),
        call(installments),
      ]);

      if (detailRes.code === 0 && installmentsRes.code === 0) {
        const response = { ...detailRes, installmentsData: installmentsRes.data };
        yield put({ type: 'detailComplete', payload: response });
      }
    },

    // 学生列表
    *student({ payload }, { call, put }) {
      const response = yield call(student, { ...payload });
      if (response.code === 0) {
        yield put({ type: 'studentComplete', payload: response });
      }
    },

    *kgName({ payload }, { call, put }) {
      const response = yield call(kgName, { ...payload });
      if (response.code === 0) {
        yield put({ type: 'kgNameComplete', payload: response });
      }
    },
  },

  reducers: {
    detailComplete(state, action) {
      const { data, types, installmentsData } = action.payload;
      const { name, gradeId } = data;
      const formContent = (data.formContent || '')
        .replace(/(&nbsp;){2}/g, String.fromCharCode(12288)) // 中文空格
        .replace(/&nbsp;/g, ' ')
        .split('\n');
      if (!formContent[0]) {
        formContent.length = 0;
      }

      // 把标准的首付分期和本制单的首付分期进行参数合并，这本应该是后台提供合并后的数据
      const periods = types
        .map(type => {
          const installment = installmentsData.find(item => type.installmentId === item.id);
          return installment
            ? {
                ...installment,
                ...type,
                type: installment.type,
              }
            : null;
        })
        .filter(type => !!type);

      return {
        ...state,
        summary: { name, formContent, gradeId },
        periods,
      };
    },

    studentComplete(state, action) {
      const { data } = action.payload;
      const students = data.map(item => ({
        value: item.id,
        label: item.name,
      }));
      return { ...state, students };
    },

    kgNameComplete(state, action) {
      const {
        data: { name: kindergartenName },
      } = action.payload;
      return { ...state, kindergartenName };
    },
  },
};
