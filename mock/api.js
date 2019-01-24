function payment(req, res) {
  res.send('123421');
}

function detail(req, res) {
  setTimeout(() => {
    res.send({
      types: [
        {
          id: 4324841822093592,
          formId: 4324841822093439,
          name: '',
          amount: 6000.0,
          type: 2,
          installmentType: 1,
          preferentialPolicy: '',
          monthAmount: 500.0,
        },
        {
          id: 4324841822093593,
          formId: 4324841822093439,
          name: '',
          amount: 11000.0,
          type: 2,
          installmentType: 2,
          preferentialPolicy: '',
          monthAmount: 458.33,
        },
        {
          id: 4324841822093596,
          formId: 4324841822093439,
          name: '',
          amount: 3100.0,
          type: 2,
          installmentType: 3,
          preferentialPolicy: '',
          monthAmount: 516.67,
        },
        {
          id: 4324841822093565,
          formId: 4324841822093439,
          name: '',
          amount: 3100.0,
          type: 2,
          installmentType: 3,
          preferentialPolicy: '',
          monthAmount: 516.67,
        },
        {
          id: 4324841822093597,
          formId: 4324841822093439,
          name: '',
          amount: 600.0,
          type: 1,
          installmentType: 5,
          preferentialPolicy: '',
          monthAmount: 600.0,
        },
      ],
      code: 0,
      data: {
        id: 4324841822093439,
        gradeId: 4282344219607140,
        name: '红太阳幼儿园2019年学费',
        type: 0,
        formType: 1,
        feeYear: null,
        feeTotal: null,
        firstRate: null,
        firstAmount: null,
        formContent: null,
        createTime: 1546606105851,
        updateTime: 1546606105851,
      },
      items: [],
    });
  }, 2000);
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
  'POST /api/checkCode': { status: 200 },
  // code获得用户token
  // 'GET /ajax/app/promotion/wechat/loginByCode': {code: 200, data: 'xxxxxwwwww'},
  'POST /app/promotion/wechat/getBonus': {code: 200, data: false},

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
