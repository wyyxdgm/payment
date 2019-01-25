import wx from 'weixin-js-sdk';

let jsTicket = false;
// 向服务器请求jsTicket，如果已经请求过则直接返回Promise的resolve
export default function() {
  return new Promise(resolve => {
    if (jsTicket) {
      resolve(wx);
      return;
    }
    const host = window.location.origin;
    // eslint-disable-next-line no-underscore-dangle
    window.g_app._store.dispatch({
      type: 'global/wxJsTicket',
      payload: { shareUrl: host + window.location.pathname },
      callback: data => {
        jsTicket = true;
        wx.config({
          debug: process.env.NODE_ENV === 'development',
          appId: data.appId,
          timestamp: parseInt(data.timestamp, 10),
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'openLocation',
            'getLocation',
          ],
        });

        wx.ready(() => {
          resolve(wx);
        });
      },
    });
  });
}
