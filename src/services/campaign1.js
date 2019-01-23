import qs from 'qs';
import request from '@/utils/request';

export async function getBonus(payload) {
  return request(`/app/promotion/wechat/bind`, { method: 'POST', body: payload });
}
