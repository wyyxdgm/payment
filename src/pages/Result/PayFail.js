import React from 'react';
import { Icon } from 'antd-mobile';
import styles from './style.less';

export default function PaySuccess() {
  return (
    <div className={styles.result}>
      <Icon type="cross-circle-o" className={styles.spe} style={{ fill: '#F13642' }} />
      <p>支付失败</p>
    </div>
  );
}
