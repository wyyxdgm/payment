export function isAliPay() {
  return /Alipay/.test(navigator.userAgent);
}

export function isWeChat() {
  return /MicroMessenger/.test(navigator.userAgent);
}
