import qs from 'qs';
import request from '@/utils/request';

export async function submit(payload) {
  return request('/ajax/pay/pay/payment', {
    method: 'POST',
    body: payload,
  });
}

export async function detail(payload) {
  return request(`/ajax/form/form/detail?${qs.stringify(payload)}`);
}

export async function cascade(payload) {
  return request(`/ajax/grade/GradeClass/getGradeAndClassByFormId?${qs.stringify(payload)}`);
}

export async function openId(payload) {
  return request('/ajax/pay/wechatPay/getOpenId', { method: 'POST', body: payload });
}

export async function getFormInfo(payload) {
  return request('/ajax/pay/wechatPay/dopay', { method: 'POST', body: payload });
}
