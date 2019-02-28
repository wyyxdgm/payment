import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ListView } from 'antd-mobile';
import cs from 'classnames';
import moment from 'moment';
import Mask from './Mask';
import NoData from '@/components/NoData';

import styles from './style.less';

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}

const handleClick = (onChange, rowData) => () => {
  onChange(rowData);
};

const row = onChange => (rowData, sectionID, rowID) => {
  return (
    <dl key={`${sectionID}-${rowID}`} onClick={handleClick(onChange, rowData)}>
      <dt>
        <p>
          <small>￥</small>
          {rowData.couponAmount}
        </p>
        <p>{rowData.useScope}期可用免息</p>
      </dt>
      <dd>
        <div>学费优惠券</div>
        <div>
          <p>
            月付{Math.floor((rowData.reachAmount - rowData.couponAmount) / rowData.useScope)}
            元起可用
          </p>
          <p>
            {rowData.validTimeType === 1
              ? `${formatDate(rowData.startTime)}～${formatDate(rowData.endTime)}`
              : '长期有效'}
          </p>
        </div>
      </dd>
      <dd className={styles['color-1']}>立即使用</dd>
    </dl>
  );
};

class Bonus extends PureComponent {
  static propTypes = {
    data: PropTypes.array.isRequired,
    show: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
    onHide: PropTypes.func,
  };

  static defaultProps = {
    onChange() {},
    onHide() {},
  };

  state = {
    isLoading: true,
    dataSource: new ListView.DataSource({ rowHasChanged: (prev, next) => prev !== next }),
  };

  componentWillReceiveProps(nextProps) {
    const { dataSource } = this.state;
    this.setState({
      dataSource: dataSource.cloneWithRows(nextProps.data),
      isLoading: false,
      hasMore: false,
    });
  }

  lvFooter = () => {
    const { isLoading, hasMore } = this.state;
    return (
      <div style={{ paddingTop: 15, textAlign: 'center' }}>
        {isLoading && '加载中...'}
        {!isLoading && hasMore && '加载更多'}
        {!isLoading && !hasMore && '已经到底了'}
      </div>
    );
  };

  normal() {
    const { dataSource, isLoading } = this.state;
    const { show, onHide, onChange } = this.props;

    return (
      <Mask show={show} onHide={onHide}>
        <div className={cs(styles.bonus)}>
          <ListView
            dataSource={dataSource}
            renderFooter={this.lvFooter}
            renderRow={row(onChange)}
            className="am-list"
            pageSize={4}
            useBodyScroll
            scrollRenderAheadDistance={300}
            onEndReached={this.onEndReached}
            onEndReachedThreshold={10}
          />
          {!isLoading && dataSource.getRowCount() === 0 && <NoData />}
        </div>
      </Mask>
    );
  }

  render() {
    return this.normal();
  }
}

export default Bonus;
