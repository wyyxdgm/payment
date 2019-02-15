import { getPageQuery } from './utils';

function needUpdateToken() {
  const { code } = getPageQuery();
  const wxCode = sessionStorage.getItem('wxCode');
  const wxTokenId = sessionStorage.getItem('wxTokenId');
  if (code) {
    if (!wxTokenId || wxCode !== code) {
      return true;
    }
  }
  return false;
}

let isWxToken = !needUpdateToken();

// 向服务器请求jsTicket，如果已经请求过则直接返回Promise的resolve
export default function(type = 1) {
  return new Promise(resolve => {
    if (isWxToken) {
      resolve();
      return;
    }
    if (needUpdateToken()) {
      const { code } = getPageQuery();
      // eslint-disable-next-line no-underscore-dangle
      window.g_app._store.dispatch({
        type: 'global/wxToken',
        payload: { code, type },
        callback: () => {
          isWxToken = true;
          resolve();
        },
      });
    }
  });
}
