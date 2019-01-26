import { getBonus, bonusList, mark } from '@/services/campaign1';

export default {
  namespace: 'campaign1',

  state: {
    bonusAmount: 0, // 红包总额
    bonusList: [], // 红包列表
  },

  effects: {
    // 领取红包
    *getBonus({ payload, callback }, { call }) {
      const response = yield call(getBonus, { ...payload });
      if (callback) {
        callback(response);
      }
    },

    // 红包列表
    *bonusList({ payload }, { call, put }) {
      const response = yield call(bonusList, { ...payload });
      if (response.code === 200) {
        yield put({ type: 'bonusListComplete', payload: response.data });
      }
    },

    // 标记地图
    *mark({ payload, callback }, { call }) {
      const response = yield call(mark, { ...payload });
      if (callback) {
        callback(response);
      }
    },
  },

  reducers: {
    bonusListComplete(state, action) {
      const data = action.payload;
      const bonusAmount = data.reduce((prev, curr) => prev + curr.couponAmount, 0);
      return { ...state, bonusList: data, bonusAmount };
    },
  },
};
