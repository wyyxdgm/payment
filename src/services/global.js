import request from '@/utils/request';
import qs from 'qs';

// 手机验证码
export async function wxCheckCode(payload) {
  const token = sessionStorage.getItem('wxTokenId');
  return request(`/ajax/app/promotion/common/msm/sendCheckCode?${qs.stringify(payload)}`, {
    headers: { token },
  });
}

// 微信根据code获取token
export async function wxToken(payload) {
  return request(`/ajax/app/promotion/wechat/loginByCode?${qs.stringify(payload)}`);
}

// 微信jsTicket
export async function wxJsTicket(payload) {
  return request(`/ajax/account/Account/getWechatShareConfigByUrl?${qs.stringify(payload)}`);
}
