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

export async function installments() {
  return request(`/ajax/pay/installmentParam/list`);
}

export async function student(payload) {
  return request(`/ajax/people/Student/query?${qs.stringify(payload)}`);
}

export async function kgName({ kindergartenId }) {
  return request(`/ajax/kind/Kindergarten/get/${kindergartenId}`);
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

// 手机验证码登录
export async function login(payload) {
  return request(`/ajax/app/promotion/user/paymentLogin?${qs.stringify(payload)}`);
}

// 获得匹配分期id的优惠券列表
export async function availableBonus(payload) {
  const token = sessionStorage.getItem('payTokenId');
  return request(
    `/ajax/app/promotion/coupon/queryUserCouponListByPayTypeId?${qs.stringify(payload)}`,
    {
      headers: { token },
    }
  );
}
