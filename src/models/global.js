import { wxCheckCode, wxToken, wxJsTicket } from '@/services/global';
import { Toast } from 'antd-mobile';
import { getPageQuery } from '@/utils/utils';

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
    *wxCheckCode({ payload, callback }, { call }) {
      const response = yield call(wxCheckCode, payload);
      if (callback) {
        callback(response);
      }
    },

    // 通过微信code获得token
    *wxToken({ payload, callback }, { call, put }) {
      const response = yield call(wxToken, payload);
      if (response.code === 200) {
        const { code } = getPageQuery();
        yield put({ type: 'wxTokenComplete', payload: response.data });
        sessionStorage.setItem('wxTokenId', response.data);
        sessionStorage.setItem('wxCode', code);
        if (callback) {
          callback();
        }
      } else {
        Toast.info(response.message);
        yield put({ type: 'wxTokenComplete', payload: '' });
      }
    },

    // 微信jsTicket，utils/wxJsTicket里使用
    *wxJsTicket({ payload, callback }, { call }) {
      const response = yield call(wxJsTicket, payload);
      if (response.code === 200) {
        if (callback) {
          callback(response);
        }
      } else {
        Toast.info('ticket获取异常');
      }
    },
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
