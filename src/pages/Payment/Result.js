import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Result, Icon } from 'antd-mobile';

const statusMap = {
  ok: '支付成功',
  fail: '支付失败',
};

@connect(({ pay }) => ({
  status: pay.result.status,
  message: pay.result.message,
}))
class ResultPage extends PureComponent {
  render() {
    const {status, message} = this.props;
    return (
      <Result
        img={<Icon type="check-circle" className="spe" style={{ fill: '#1F90E6' }} />}
        title={statusMap[status]}
        message={message}
      />
    );
  }
}

export default ResultPage;
