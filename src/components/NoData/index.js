import React from 'react';
import icon from './noData.png';
import styles from './style.less';

export default function ({ top = '100px', msg = '暂无数据' }) {
  return (
    <div className={styles.container} style={{ marginTop: top }}>
      <div>
        <img src={icon} alt="没有记录" />
      </div>
      <p>{msg}</p>
    </div>
  );
}
