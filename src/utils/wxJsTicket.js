import wx from 'weixin-js-sdk';

let status = 'init'; // waiting | done

function pool(resolve) {
  if (status === 'done') {
    resolve(wx);
  } else if (status === 'waiting') {
    setTimeout(() => {
      pool(resolve);
    }, 1000);
  }
}

// 页面路由发生跳转，需要重新进行请求，并配置
export function ticketClear() {
  status = 'init';
}

// 向服务器请求jsTicket，如果已经请求过则直接返回Promise的resolve
export default function() {
  return new Promise(resolve => {
    if (status === 'done') {
      resolve(wx);
      return;
    }

    if (status === 'waiting') {
      pool(resolve);
      return;
    }

    status = 'waiting';

    // eslint-disable-next-line no-underscore-dangle
    window.g_app._store.dispatch({
      type: 'global/wxJsTicket',
      payload: { shareUrl: window.location.href },
      callback: data => {
        status = 'done';
        wx.config({
          debug: false, // process.env.NODE_ENV === 'development',
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
