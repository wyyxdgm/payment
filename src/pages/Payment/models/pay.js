import mapKeys from 'lodash/mapKeys';
import find from 'lodash/find';
import qs from 'qs';
import { submit, detail, cascade, openId, getFormInfo } from '@/services/pay';
import { jsonToFormData } from '@/utils/convert';

const keyMap = {
  gradeId: 'value',
  classId: 'value',
  gradeName: 'label',
  className: 'label',
  classResultList: 'children',
};

// 把服务端的数据字段转为cascade所需要的格式
function toCascade(data) {
  return data.map(item => {
    const newItem = mapKeys(item, (value, key) => keyMap[key] || key);
    if (newItem.children) {
      newItem.children = toCascade(newItem.children);
    }
    return newItem;
  });
}

// 通过年级班级值得到名称
function getClassName(data, gId, cId) {
  const grade = find(data, { value: gId });
  if (grade) {
    const classRow = find(grade.children, { value: cId });
    if (classRow) {
      return classRow.label;
    }
  }
  return '';
}

export default {
  namespace: 'pay',

  state: {
    summary: {
      name: '',
      feeTotal: 0,
      firstAmount: 0,
      formContent: [],
    },
    classes: [],
    typeId: 0,
    result: {
      status: 'ok',
      message: '',
    }
  },

  effects: {
    // 支付提交
    *submit({ payload, callback }, { call, select }) {
      const { classes, typeId } = yield select(({ pay }) => ({
        classes: pay.classes,
        typeId: pay.typeId,
      }));
      const className = getClassName(classes, ...payload.classId);
      const payPhone = payload.payPhone.replace(/\s/g, '');
      const classId = payload.classId.slice(-1).pop();
      const formData = jsonToFormData({ ...payload, payPhone, classId, className, typeId });
      const response = yield call(submit, formData);
      if (callback) {
        callback(response);
      }
    },

    *openId({payload, callback}, {call}){
      const formData = jsonToFormData({...payload, kindergartenId: 0});
      const response = yield call(openId, formData);
      if (callback) {
        callback(response);
      }
    },

    *getFormInfo({payload, callback}, {call}){
      const formData = jsonToFormData(payload);
      const response = yield call(getFormInfo, formData);
      if (callback) {
        callback(qs.parse(response));
      }
    },

    // 分期信息
    *detail({ payload }, { call, put }) {
      const response = yield call(detail, { ...payload });
      if (response.code === 0) {
        yield put({ type: 'detailComplete', payload: response });
      }
    },

    // 年级、班级联动菜单
    *cascade({ payload }, { call, put }) {
      const response = yield call(cascade, { ...payload });
      yield put({ type: 'cascadeComplete', payload: response });
    },
  },

  reducers: {
    detailComplete(state, action) {
      const { data, types } = action.payload;
      const typeId = types[0].id;
      const { name, feeTotal, firstAmount } = data;
      const formContent = data.formContent.split('\n');

      return { ...state, summary: { name, formContent, feeTotal, firstAmount }, typeId };
    },
    cascadeComplete(state, action) {
      const classes = toCascade(action.payload);
      return { ...state, classes };
    },
  },
};
