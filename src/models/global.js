import { phoneCheckCode, wxToken, wxShared } from '@/services/global';

export default {
  namespace: 'global',

  state: {
    result: {
      status: 'fail',
      message: '',
    },
    wxToken: '',
  },

  effects: {
    // 状态页
    *result({ payload }, { put }) {
      yield put({ type: 'resultComplete', payload });
    },

    // 手机验证码
    *checkCode({ payload, callback }, { call }) {
      const response = yield call(phoneCheckCode, payload);
      if (callback) {
        callback(response);
      }
    },

    // 通过微信code获得token
    *wxToken({ payload }, { call, put }) {
      const response = yield call(wxToken, payload);
      if (response.code === 200) {
        yield put({ type: 'wxTokenComplete', payload: response.data });
        sessionStorage.setItem('wxTokenId', response.data);
      }
    },

    *wxShared({payload, callback}, {call}) {
      const response = yield call(wxShared, payload);
      if (response.code === 200) {
        if (callback) {
          callback(response);
        }
      }
    }
  },

  reducers: {
    resultComplete(state, action) {
      return { ...state, result: action.payload };
    },
    wxTokenComplete(state, action) {
      return { ...state, wxToken: action.payload };
    },
  },
};
