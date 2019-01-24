import request from '@/utils/request';
import qs from 'qs';

// 手机验证码
export async function wxCheckCode(payload) {
  return request(`/ajax/app/promotion/common/msm/sendCheckCode?${qs.stringify(payload)}`);
}

// 微信根据code获取token
export async function wxToken(payload) {
  return request(`/ajax/app/promotion/wechat/loginByCode?${qs.stringify(payload)}`);
}

// 微信分享请求组串
export async function wxShared(payload) {
  return request(`/ajax/account/Account/getWechatShareConfigByUrl?${qs.stringify(payload)}`);
}
