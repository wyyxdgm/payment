import qs from 'qs';
import { submit, detail, openId, getFormInfo, student } from '@/services/pay';
import { jsonToFormData } from '@/utils/convert';

export default {
  namespace: 'pay',

  state: {
    summary: {
      name: '',
      gradeId: 0,
      feeTotal: 0,
      firstAmount: 0,
      formContent: [],
    },
    typeId: 0,
    students: [],
  },

  effects: {
    // 支付提交
    *submit({ payload, callback }, { call, select }) {
      const gradeId = yield select(({pay}) => pay.summary.gradeId);
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
    *detail({ payload }, { call, put }) {
      const response = yield call(detail, { ...payload });
      if (response.code === 0) {
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
  },

  reducers: {
    detailComplete(state, action) {
      const { data, types } = action.payload;
      const typeId = types[0].id;
      const { name, feeTotal, firstAmount, gradeId } = data;
      const formContent = data.formContent
        .replace(/(&nbsp;){2}/g, String.fromCharCode(12288))  // 中文空格
        .replace(/&nbsp;/g, ' ')
        .split('\n');

      return { ...state, summary: { name, formContent, feeTotal, firstAmount, gradeId }, typeId };
    },

    studentComplete(state, action) {
      const { data } = action.payload;
      const students = data.map(item => ({
        value: item.id,
        label: item.name,
      }));
      return { ...state, students };
    },
  },
};
