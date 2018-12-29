import React from 'react';
import { Icon } from 'antd-mobile';
import styles from './style.less';

export default function PaySuccess() {
  return (
    <div className={styles.result}>
      <Icon type="check-circle" className={styles.spe} style={{ fill: '#FFB803' }} />
      <p>支付成功</p>
    </div>
  );
}
