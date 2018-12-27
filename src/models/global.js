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
      yield put({ type: 'resultComplete', payload });
    },
  },

  reducers: {
    resultComplete(state, action) {
      return { ...state, result: action.payload };
    },
  },
};
