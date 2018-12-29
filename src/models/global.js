export default {
  namespace: 'global',

  state: {
    result: {
      status: 'fail',
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
