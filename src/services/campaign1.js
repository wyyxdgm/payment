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

export async function bonusList(payload) {
  const token = sessionStorage.getItem('wxTokenId');
  return request(
    `/ajax/app/promotion/coupon/queryCouponListByActivityId?${qs.stringify(payload)}`,
    {
      headers: { token },
    }
  );
}

export async function mark(payload) {
  const token = sessionStorage.getItem('wxTokenId');
  return request(`/ajax/app/promotion/sign/kindergarten/signKindergarten`, {
    headers: { token },
    method: 'POST',
    body: payload,
  });
}
