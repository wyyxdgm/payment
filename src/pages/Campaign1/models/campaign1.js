import { Toast } from 'antd-mobile';
import { getBonus, bonusList, bonusListPage, mark, campaignStatus } from '@/services/campaign1';

export function convertList(data) {
  const { list } = data;
  const pagination = {
    current: data.pageNo,
    pageSize: data.pageSize,
    total: data.totalCount,
  };

  return { list, pagination };
}

export default {
  namespace: 'campaign1',

  state: {
    bonusAmount: 0, // 红包总额
    bonusList: [], // 红包列表
    pagination: {}, // 红包页
    kgName: '', // 幼儿园名称
  },

  effects: {
    // 领取红包
    *getBonus({ payload, callback }, { call }) {
      const response = yield call(getBonus, { ...payload });
      if (response.code || response.code === 0) {
        if (callback) {
          callback(response);
        }
      } else {
        Toast.info('领取红包获取异常');
      }
    },

    // 红包列表
    *bonusList({ payload }, { call, put }) {
      const response = yield call(bonusList, { ...payload });
      if (response.code === 200) {
        yield put({ type: 'bonusListComplete', payload: response.data });
      }
    },

    // 红包列表 有分页功能
    *bonusListPage({ payload }, { call, put }) {
      const response = yield call(bonusListPage, { ...payload });
      if (response.code === 200) {
        yield put({ type: 'bonusListPageComplete', payload: response.data });
      }
    },

    // 标记地图
    *mark({ payload, callback }, { call, put }) {
      const response = yield call(mark, { ...payload });
      if (callback) {
        if (response.code === 200) {
          yield put({ type: 'markComplete', payload: payload.name });
        }
        callback(response);
      }
    },

    // 判断活动是否未开始或者已结束
    *campaignStatus({ payload, callback }, { call }) {
      const response = yield call(campaignStatus, { ...payload });
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

    bonusListPageComplete(state, action) {
      const data = convertList(action.payload);
      const currPagination = state.pagination;
      // 如果加载之前数据，则清空红包列表数据
      const clear = currPagination.current >= data.pagination.current;

      return {
        ...state,
        bonusList: clear ? data.list : [...state.bonusList, ...data.list],
        pagination: data.pagination,
      };
    },

    markComplete(state, action) {
      return { ...state, kgName: action.payload.toString().trim() };
    },
  },
};
