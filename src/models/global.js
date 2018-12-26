export default {
  namespace: 'global',

  state: {
    result: {
      status: 'ok',
      message: '',
    },
  },

  effects: {
    *result({ payload }, { put }) {
      yield put({ type: 'result', payload });
    },
  },

  reducers: {
    result(state, action) {
      return { ...state, result: action.payload };
    },
  },
};
