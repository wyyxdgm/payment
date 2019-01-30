import React, { PureComponent } from 'react';
import { Button } from 'antd-mobile';
import iconWaiting from '../../assets/campaign1/progressWait.png';

import styles from './Progress.less';

// 等待处理
function Wait({ onLink }) {
  return (
    <div className={styles.container}>
      <img src={iconWaiting} alt="等待处理" />
      <h1>等待处理</h1>
      <section>
        <p>已提交申请，等待客服处理</p>
        <p>
          客服人员会在48小时内与您取得联系，或请致电<a href="tel:01062842040">010-62842040</a>
        </p>
      </section>
      <div className={styles.btnArea}>
        <Button onClick={onLink}>
          <span>我要入驻</span>
        </Button>
      </div>
    </div>
  );
}

export default class extends PureComponent {
  handleWaitLink = () => {
    window.location.href = `https://agent.hoogoo.cn/apply/school.html?userId=0&agentId=1`;
  };

  render() {
    return <Wait onLink={this.handleWaitLink} />;
  }
}
