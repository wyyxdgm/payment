import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Toast, ListView } from 'antd-mobile';
import { createForm } from 'rc-form';
import cs from 'classnames';
import qs from 'qs';
import moment from 'moment';
import wxToken from '@/utils/wxToken';
import NoData from '@/components/NoData';
import Loading from '@/components/PageLoading';
import BindMobile from './components/BindMobile';

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

const row = mobileBound => (rowData, sectionID, rowID) => {
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
            {rowData.validTimeType === 1
              ? `${formatDate(rowData.startTime)}～${formatDate(rowData.endTime)}`
              : '长期有效'}
          </p>
        </div>
      </dd>
      <dd className={mobileBound ? styles[`color-${rowData.status}`] : styles['color-3']}>
        {mobileBound ? statusMap[rowData.status] : '未关联'}
      </dd>
    </dl>
  );
};

@connect(({ campaign1, global, loading }) => ({
  bonusList: campaign1.bonusList,
  pagination: campaign1.pagination,
  mobileBound: global.mobileBound,
  loading: loading.effects['global/wxToken'] || loading.effects['global/isMobileBind'],
}))
@createForm()
class Bonus extends PureComponent {
  state = {
    isLoading: true,
    bindShow: false,
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
        dispatch({ type: 'global/isMobileBind', payload: { type: 1 } });
      });
    } else {
      Toast.info('请指定一个优惠活动');
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource } = this.state;
    this.setState({
      dataSource: dataSource.cloneWithRows(nextProps.bonusList),
      isLoading: false,
      hasMore: nextProps.bonusList.length < nextProps.pagination.total,
    });
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
    const { isLoading, hasMore, dataSource } = this.state;
    return (
      <div style={{ paddingTop: 15, textAlign: 'center' }}>
        {isLoading && '加载中...'}
        {dataSource.getRowCount() > 0 && !isLoading && hasMore && '加载更多'}
        {dataSource.getRowCount() > 0 && !isLoading && !hasMore && '已经到底了'}
      </div>
    );
  };

  // 关联手机号结果响应
  handleBind = error => {
    if (!error) {
      Toast.info('关联手机成功', 3, null, false);
    }
  };

  // 绑定手机组建消失响应
  handleBindHide = fromChildren => {
    if (!fromChildren) {
      this.setState({ bindShow: false });
    }
  };

  // 关联手机按钮响应
  handleBindButton = () => {
    this.setState({ bindShow: true });
  };

  normal() {
    const { dataSource, isLoading, bindShow } = this.state;
    const { mobileBound } = this.props;

    return (
      <div className={cs(styles.bonus)}>
        {!mobileBound && (
          <div className={styles.bind}>
            <span onClick={this.handleBindButton}>关联手机号</span>即可使用优惠券
          </div>
        )}
        <ListView
          dataSource={dataSource}
          renderFooter={this.lvFooter}
          renderRow={row(mobileBound)}
          className="am-list"
          pageSize={4}
          useBodyScroll
          scrollRenderAheadDistance={300}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={10}
        />
        {!isLoading && dataSource.getRowCount() === 0 && <NoData />}
        <BindMobile show={bindShow} onBind={this.handleBind} onHide={this.handleBindHide} />
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
