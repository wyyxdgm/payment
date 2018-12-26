import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Result, Icon } from 'antd-mobile';

@connect(({ global }) => ({
  message: global.result.message,
}))
class ResultPage extends PureComponent {
  render() {
    const { message } = this.props;
    return (
      <Result
        img={<Icon type="check-circle" className="spe" style={{ fill: '#1F90E6' }} />}
        title="支付成功"
        message={message}
      />
    );
  }
}

export default ResultPage;
