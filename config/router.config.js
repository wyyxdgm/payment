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
        routes: [
          { path: '.', redirect: '/campaign1/patriarch' },
          { path: 'patriarch', name: '和谷猪年送豪礼', component: './Campaign1/Patriarch' },
          { path: 'got-bonus', name: '和谷学费宝发红包啦', component: './Campaign1/GotBonus' },
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
