import qs from 'qs';
import request from '@/utils/request';

export async function submit(payload) {
  return request('/ajax/pay/pay/payment', {
    headers: { Accept: 'text/html' },
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

export async function student(payload) {
  return request(`/ajax/people/Student/query?${qs.stringify(payload)}`);
}

export async function appId(payload) {
  return request(`/ajax/pay/payParam/getPayParam?${qs.stringify(payload)}`);
}

export async function openId(payload) {
  return request('/ajax/pay/wechatPay/getOpenId', {
    headers: { Accept: 'text/html' },
    method: 'POST',
    body: payload,
  });
}

export async function getFormInfo(payload) {
  return request('/ajax/pay/wechatPay/dopay', {
    headers: { Accept: 'text/html' },
    method: 'POST',
    body: payload,
  });
}
