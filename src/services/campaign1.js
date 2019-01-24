import qs from 'qs';
import request from '@/utils/request';

export async function getBonus(payload) {
  const token = sessionStorage.getItem('wxTokenId');
  return request(`/ajax/app/promotion/coupon/receiveCoupon`, {
    headers: { token },
    method: 'POST',
    body: payload,
  });
}
