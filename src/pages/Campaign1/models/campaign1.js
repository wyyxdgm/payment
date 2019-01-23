import { getBonus } from '@/services/campaign1';

export default {
  namespace: 'campaign1',

  state: {
  },

  effects: {
    *getBonus({payload, callback}, {call}) {
      const wxTokenId = sessionStorage.getItem('wxTokenId');
      const response = yield call(getBonus, {...payload, wxTokenId});
      if (response.code === 200) {
        if (callback) {
          callback(response.data);
        }
      }
    }
  },

  reducers: {
  },
};
