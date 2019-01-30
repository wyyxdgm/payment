import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Toast, ListView } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import wxToken from '@/utils/wxToken';
import NoData from '@/components/NoData';
import Loading from '@/components/PageLoading';

import styles from './Bonus.less';

const statusMap = {
  1: '未使用',
  2: '使用中',
  3: '已过期',
};

const PAGE_SIZE = 10;

function formatDate(date) {
  return moment(date).format('YYYY-MM-DD');
}

function row(rowData, sectionID, rowID) {
  return (
    <dl key={`${sectionID}-${rowID}`}>
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
            {formatDate(rowData.startTime)}～{formatDate(rowData.endTime)}
          </p>
        </div>
      </dd>
      <dd className={styles[`color-${rowData.status}`]}>{statusMap[rowData.status]}</dd>
    </dl>
  );
}

@connect(({ campaign1, loading }) => ({
  bonusList: campaign1.bonusList,
  pagination: campaign1.pagination,
  loading: loading.effects['global/wxToken'],
}))
class Bonus extends PureComponent {
  state = {
    isLoading: true,
    dataSource: new ListView.DataSource({ rowHasChanged: (prev, next) => prev !== next }),
  };

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const { code, activityId = 0 } = query;

    if (!code) {
      const payload = {
        appid: process.env.APP_ID,
        redirect_uri: window.location.href,
        response_type: 'code',
        scope: 'snsapi_userinfo',
        state: 'STATE',
      };
      window.location.replace(
        `https://open.weixin.qq.com/connect/oauth2/authorize?${qs.stringify(
          payload
        )}#wechat_redirect`
      );
    } else if (activityId) {
      wxToken().then(() => {
        dispatch({
          type: 'campaign1/bonusListPage',
          payload: { activityId, pageNo: 1, pageSize: PAGE_SIZE },
        });
      });
    } else {
      Toast.info('请指定一个优惠活动');
    }
  }

  componentWillReceiveProps(nextProps) {
    // eslint-disable-next-line react/destructuring-assignment
    if (!isEqual(nextProps.pagination, this.props.pagination)) {
      const { dataSource } = this.state;
      this.setState({
        dataSource: dataSource.cloneWithRows(nextProps.bonusList),
        isLoading: false,
        hasMore: nextProps.bonusList.length < nextProps.pagination.total,
      });
    }
  }

  onEndReached = () => {
    const {
      location: { query },
      dispatch,
      pagination: { current },
    } = this.props;
    const { activityId } = query;
    const { isLoading, hasMore } = this.state;

    if (isLoading || !hasMore) {
      return;
    }
    this.setState({ isLoading: true });
    dispatch({
      type: 'campaign1/bonusListPage',
      payload: { activityId, pageNo: current + 1, pageSize: PAGE_SIZE },
    });
  };

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
    return (
      <div className={cs(styles.bonus)}>
        <ListView
          dataSource={dataSource}
          renderFooter={this.lvFooter}
          renderRow={row}
          className="am-list"
          pageSize={4}
          useBodyScroll
          scrollRenderAheadDistance={300}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={10}
        />
        {!isLoading && dataSource.getRowCount() === 0 && <NoData />}
      </div>
    );
  }

  render() {
    const {
      location: { query },
      loading,
    } = this.props;
    const { code } = query;
    return loading || !code ? <Loading /> : this.normal();
  }
}

export default Bonus;
