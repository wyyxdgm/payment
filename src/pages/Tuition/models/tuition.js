import qs from 'qs';
import { submit, detail, student, appId, openId, getFormInfo } from '@/services/pay';
import { jsonToFormData } from '@/utils/convert';

export default {
  namespace: 'tuition',

  state: {
    summary: {
      name: '',
    },
    staging: [],
    students: [],
  },

  effects: {
    // 支付提交
    *submit({ payload, callback }, { call }) {
      const formData = jsonToFormData({ ...payload });
      const response = yield call(submit, formData);
      if (callback) {
        callback(response);
      }
    },

    *appId({ payload, callback }, { call }) {
      const response = yield call(appId, { ...payload, type: 2 });
      if (response.code === 0) {
        if (callback) {
          const content = response.data ? response.data.content : '';
          callback(content);
        }
      }
    },

    *openId({ payload, callback }, { call }) {
      const formData = jsonToFormData({ ...payload });
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
      const { name } = data;
      types.sort((a, b) => b.type - a.type);

      return { ...state, summary: { name }, staging: [...types] };
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
