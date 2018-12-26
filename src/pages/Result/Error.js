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
        img={<Icon type="cross-circle-o" className="spe" style={{ fill: '#F13642' }} />}
        title="支付失败"
        message={message}
      />
    );
  }
}

export default ResultPage;
