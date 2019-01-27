export default [
  // app
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      { path: '/payment', component: './Payment' },
      { path: '/tuition', component: './Tuition' },
      { path: '/shared', component: './Shared' },
      {
        path: '/campaign1',
        name: '和谷学费宝',
        routes: [
          { path: '.', redirect: '/campaign1/patriarch' },
          { path: 'patriarch', name: '和谷猪年送豪礼', component: './Campaign1/Patriarch' },
          { path: 'got-bonus', name: '和谷学费宝发红包啦', component: './Campaign1/GotBonus' },
          { path: 'bonus', name: '我的红包', component: './Campaign1/Bonus' },
          { path: 'mark', name: '和谷猪年送豪礼', component: './Campaign1/Mark' },
          { path: 'markSuccess', name: '和谷猪年送豪礼', component: './Campaign1/MarkSuccess' },
          { path: 'progress', name: '进度查询', component: './Campaign1/Progress' },
        ],
      },
      {
        path: '/result',
        routes: [
          { path: '/result', redirect: '/result/pay-success' },
          { path: '/result/pay-success', component: './Result/PaySuccess' },
          { path: '/result/pay-cancel', component: './Result/PayCancel' },
          { path: '/result/pay-fail', component: './Result/PayFail' },
        ],
      },
      {
        name: 'exception',
        icon: 'warning',
        path: '/exception',
        routes: [
          // exception
          {
            path: '/exception/403',
            name: 'not-permission',
            component: './Exception/403',
          },
          {
            path: '/exception/404',
            name: 'not-find',
            component: './Exception/404',
          },
          {
            path: '/exception/500',
            name: 'server-error',
            component: './Exception/500',
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
