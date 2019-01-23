import request from '@/utils/request';
import qs from 'qs';

export async function phoneCheckCode(payload) {
  return request(`/api/checkCode`, { method: 'POST', body: payload });
}

export async function wxToken(payload) {
  return request(`/app/promotion/wechat/loginByCode?${qs.stringify(payload)}`);
}

export async function wxShared(payload) {
  return request(`/ajax/account/Account/getWechatShareConfigByUrl?${qs.stringify(payload)}`);
}
