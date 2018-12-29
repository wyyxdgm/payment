import React from 'react';
import { ReactComponent as Warning } from '@/assets/icon/warning.svg';
import styles from './style.less';

export default function PaySuccess() {
  return (
    <div className={styles.result}>
      <Warning className={styles.spe} style={{ fill: '#FFB803' }} />
      <p>取消支付</p>
    </div>
  );
}
