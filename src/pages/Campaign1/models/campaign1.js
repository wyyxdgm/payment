import { getBonus } from '@/services/campaign1';

export default {
  namespace: 'campaign1',

  state: {},

  effects: {
    // 领红包
    *getBonus({ payload, callback }, { call }) {
      const response = yield call(getBonus, { ...payload });
      if (callback) {
        callback(response);
      }
    },
  },

  reducers: {},
};
