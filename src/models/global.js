import { wxCheckCode, wxToken, wxJsTicket, bindMobile, isMobileBind } from '@/services/global';
import { Toast } from 'antd-mobile';
import { getPageQuery } from '@/utils/utils';
import { ticketClear } from '@/utils/wxJsTicket';

export default {
  namespace: 'global',

  state: {
    result: {
      status: 'fail',
      message: '',
    },
    wxToken: '',
    mobileBound: false,
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
      if (response.code || response.code === 0) {
        if (callback) {
          callback(response);
        }
      } else {
        Toast.info('ticket获取异常');
      }
    },

    // 绑定手机号
    *bindMobile({ payload, callback }, { call, put }) {
      const response = yield call(bindMobile, payload);
      if (response.code || response.code === 0) {
        if (callback) {
          callback(response);
        }
        if (response.code === 200) {
          yield put({ type: 'isMobileBindComplete', payload: response.data });
        }
      } else {
        Toast.info('绑定手机号获取异常');
      }
    },

    // 是否绑定手机号
    *isMobileBind({ payload, callback }, { call, put }) {
      const response = yield call(isMobileBind, payload);
      if (response.code || response.code === 0) {
        if (callback) {
          callback(response);
        }
        yield put({ type: 'isMobileBindComplete', payload: response.data });
      } else {
        Toast.info('是否绑定手机号获取异常');
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
    isMobileBindComplete(state, action) {
      return { ...state, mobileBound: action.payload };
    },
  },

  subscriptions: {
    setup({ history }) {
      history.listen(() => {
        ticketClear();
      });
    },
  },
};
