import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, WhiteSpace, Toast } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';
import Mask from '@/components/Mask';
import Loading from '@/components/PageLoading';
import wxJsTicket from '@/utils/wxJsTicket';
import wxToken from '@/utils/wxToken';

import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import markMdm from '@/assets/campaign1/markMdm.png';
import imgGzh from '@/assets/campaign1/gongzhonghao.png';
import 'swiper/dist/css/swiper.css';

import styles from './style.less';

@connect(({ campaign1, loading }) => ({
  bonusAmount: campaign1.bonusAmount,
  bonusList: campaign1.bonusList,
  loading:
    loading.effects['global/wxToken'] ||
    loading.effects['global/wxJsTicket']
}))
class MarkSuccess extends PureComponent {
  state = { maskShow: false, maskContent: 'share' };

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const { activityId } = query;

    if (activityId) {
      wxToken().then(() => {
        dispatch({ type: 'campaign1/bonusList', payload: { activityId } });
      });
    } else {
      Toast.info('请指定一个优惠活动');
    }

    const host = window.location.origin;
    wxJsTicket().then(wx => {
      wx.onMenuShareAppMessage({
        title: '分享出来就是让你戳进来领红包的',
        desc: '传递新年新财气，和谷春节送大礼',
        link: `${host}/mform/campaign1/patriarch?${qs.stringify({ type: 1, activityId })}`,
        imgUrl: host + sharedLinkIcon,
      });
    });
  }

  maskHideHandle = () => {
    this.setState({ maskShow: false });
  };

  // 分享按钮响应
  handleShareClick = () => {
    const {
      location: { query },
    } = this.props;
    const { activityId } = query;
    const host = window.location.origin;

    this.setState({ maskShow: true, maskContent: 'share' });
    wxJsTicket().then(wx => {
      wx.onMenuShareAppMessage({
        title: '分享出来就是让你戳进来领红包的',
        desc: '传递新年新财气，和谷春节送大礼',
        link: `${host}/mform/campaign1/patriarch?${qs.stringify({ type: 1, activityId })}`,
        imgUrl: host + sharedLinkIcon,
      });
    });
  };

  // 面对面撒红包
  handleMdmClick = () => {
    this.setState({ maskShow: true, maskContent: 'mdm' });
  };

  normal() {
    const { maskShow, maskContent } = this.state;

    return (
      <div className={cs(styles.container, styles.markSuccess)}>
        <div className={styles.btnArea}>
          <Button onClick={this.handleShareClick}>分享家长领红包</Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleMdmClick}>面对面撒红包</Button>
        </div>

        <div className={styles.gzh}>
          <img src={imgGzh} alt="公众号" />
          <p>
            关注和谷学费宝公众号在我的-<span>我的红包</span>即可查看
          </p>
        </div>

        <Mask show={maskShow} onHide={this.maskHideHandle}>
          {maskContent === 'share' && (
            <img src={sharedTip} className={styles.maskShare} alt="右上角分享" />
          )}
          {maskContent === 'mdm' && (
            <div className={styles.maskMdm}>
              <img src={markMdm} alt="面对面撒红包" />
            </div>
          )}
        </Mask>
      </div>
    );
  }

  render() {
    const { loading } = this.props;
    return loading ? <Loading /> : this.normal();
  }
}

export default MarkSuccess;
