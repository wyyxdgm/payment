import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Result, Icon } from 'antd-mobile';

const myImg = src => <img src={src} className="spe am-icon am-icon-md" alt="" />;

@connect(({ global }) => ({
  status: global.result.status,
  message: global.result.message,
}))
class ResultPage extends PureComponent {
  render() {
    const { status, message } = this.props;
    return (
      <div style={{display: 'flex', alignItems: 'center', height: '100vh'}}>
        {status === 'ok' && (
          <Result
            img={<Icon type="check-circle" className="spe" style={{ fill: '#1F90E6' }} />}
            title="支付成功"
            message={message}
          />
        )}
        {status === 'cancel' && (
          <Result
            img={myImg('https://gw.alipayobjects.com/zos/rmsportal/GIyMDJnuqmcqPLpHCSkj.svg')}
            title="取消支付"
            message={message}
          />
        )}
        {status === 'fail' && (
          <Result
            img={<Icon type="cross-circle-o" className="spe" style={{ fill: '#F13642' }} />}
            title="支付失败"
            message={message}
          />
        )}
      </div>
    );
  }
}

export default ResultPage;
