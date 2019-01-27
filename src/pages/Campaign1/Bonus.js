import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Toast, ListView } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';
import moment from 'moment';
import wxToken from '@/utils/wxToken';
import NoData from '@/components/NoData';
import Loading from '@/components/PageLoading';

import styles from './Bonus.less';

const statusMap = {
  1: '未使用',
  2: '使用中',
  3: '已过期',
};

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
            月付{Math.floor((rowData.reachAmount - rowData.couponAmount) / rowData.useScope)}元起可用
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
  loading: loading.effects['global/wxToken'] || loading.effects['campaign1/bonusList'],
}))
class Bonus extends PureComponent {
  state = {
    isLoading: true,
    hasMore: false,
    dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
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
        dispatch({ type: 'campaign1/bonusList', payload: { activityId } });
      });
    } else {
      Toast.info('请指定一个优惠活动');
    }
  }

  componentWillReceiveProps(nextProps) {
    // eslint-disable-next-line react/destructuring-assignment
    if (nextProps.bonusList !== this.props.bonusList) {
      const { dataSource } = this.state;
      this.setState({
        dataSource: dataSource.cloneWithRows(nextProps.bonusList),
        isLoading: false,
      });
    }
  }

  // onEndReached = () => {
  //   const {
  //     location: { query },
  //     dispatch,
  //   } = this.props;
  //   const { activityId } = query;
  //   const { isLoading, hasMore } = this.state;
  //
  //   if (isLoading && !hasMore) {
  //     return;
  //   }
  //   this.setState({ isLoading: true });
  //   dispatch({ type: 'campaign1/bonusList', payload: { activityId } });
  // };

  normal() {
    const { dataSource } = this.state;
    return (
      <div className={cs(styles.bonus)}>
        <ListView
          dataSource={dataSource}
          renderRow={row}
          className="am-list"
          pageSize={1}
          useBodyScroll
          scrollRenderAheadDistance={500}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={10}
        />
        {dataSource.rowIdentities.length === 0 && <NoData />}
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
