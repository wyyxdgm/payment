function payment(req, res) {
  res.send('123421');
}

function detail(req, res) {
  res.send({
    code: 0,
    data: {
      name: '阳光雨露幼儿园学费1年分期首付款预交',
      formContent:
        '111餐饮费:￥3400.00元/学生·月\n' +
        '餐饮费:￥3400.00元/学生·月\n' +
        '餐饮费:￥3400.00元/学生·月',
      feeTotal: 19000,
      firstAmount: 5999,
    },
    types: [{id:1}, 2, 3],
  });
}

function cascade(req, res) {
  res.send([
    {
      gradeId: 4248292624171019,
      gradeName: '小班',
      classResultList: [{ classId: 4255481384402946, className: '小一班' }],
    },
    {
      gradeId: 4248292758388766,
      gradeName: '中班',
      classResultList: [
        { classId: 4248295732150287, className: '中一班' },
        { classId: 4249866620633107, className: '中二班' },
        { classId: 4250922649911319, className: '1' },
      ],
    },
    { gradeId: 4253028819664906, gradeName: '1', classResultList: [] },
    { gradeId: 4253029083906063, gradeName: '2', classResultList: [] },
    { gradeId: 4253726311448601, gradeName: '大班', classResultList: [] },
    { gradeId: 4254805262598178, gradeName: '托儿班', classResultList: [] },
    {
      gradeId: 4260210495717418,
      gradeName: '培训班',
      classResultList: [{ classId: 4260210655100940, className: '美术班' }],
    },
    { gradeId: 4271405319585795, gradeName: '11', classResultList: [] },
    {
      gradeId: 4275463161905159,
      gradeName: '测试年级',
      classResultList: [{ classId: 4275463577141256, className: '三年级二班' }],
    },
  ]);
}

export default {
  // 'POST /ajax/pay/pay/payment': payment,
  // 'GET /ajax/form/form/detail': detail,
  // 'GET /ajax/grade/GradeClass/getGradeAndClassByFormId': cascade,
  'GET /api/500': (req, res) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req, res) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req, res) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req, res) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },
};
