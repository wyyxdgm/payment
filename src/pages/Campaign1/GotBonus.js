import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, WhiteSpace, Toast } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';
import Mask from '@/components/Mask';
import { getPageQuery } from '@/utils/utils';
import Loading from '@/components/PageLoading';
import wxJsTicket from '@/utils/wxJsTicket';
import wxToken from '@/utils/wxToken';
import BonusSwipe from './BonusSwip';

import sharedLinkIconKg from '@/assets/campaign1/sharedLinkIconKg.png';
import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import imgGuide from '@/assets/campaign1/bonusGuide.png';
import imgGzh from '@/assets/campaign1/gongzhonghao.png';
import 'swiper/dist/css/swiper.css';

import common from './style.less';
import styles from './GotBonus.less';

@connect(({ campaign1, loading }) => ({
  bonusAmount: campaign1.bonusAmount,
  bonusList: campaign1.bonusList,
  loading:
    loading.effects['global/wxToken'] ||
    loading.effects['global/wxJsTicket'] ||
    loading.effects['campaign1/bonusList'],
}))
class GotBonus extends PureComponent {
  state = { maskShow: false };

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const { code, activityId } = query;

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
      wxJsTicket().then(wx => {
        const host = window.location.origin;
        wx.onMenuShareAppMessage({
          title: '分享出来就是让你戳进来领红包的',
          desc: '传递新年新财气，和谷春节送大礼',
          link: `${host}/mform/campaign1/patriarch?${qs.stringify({ type: 1, activityId })}`,
          imgUrl: host + sharedLinkIcon,
        });
      });
    } else {
      Toast.info('请指定一个优惠活动');
    }
  }

  maskHideHandle = () => {
    this.setState({ maskShow: false });
  };

  // 分享按钮响应
  handleShareClick = () => {
    this.setState({ maskShow: true });
  };

  handleLink = () => {
    const {
      location: { query },
    } = this.props;
    const { activityId } = query;
    const host = window.location.origin;
    window.location.href = `${host}/mform/campaign1/guide-for-ph?${qs.stringify({ activityId })}`;
  };

  normal() {
    const { maskShow } = this.state;

    const { bonusAmount, bonusList } = this.props;

    return (
      <div className={cs(styles.container)}>
        <div className={styles.amount}>{bonusAmount}</div>
        <BonusSwipe data={bonusList} />
        <div className={styles.guide}>
          <img src={imgGuide} alt="红包使用攻略" />
        </div>

        <div className={common.btnArea}>
          <Button onClick={this.handleShareClick}>分享给好友</Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleLink}>使用红包</Button>
        </div>

        <div className={common.gzh}>
          <img src={imgGzh} alt="公众号" />
          <p>
            关注和谷学费宝公众号在我的-<span>我的红包</span>即可查看
          </p>
        </div>

        <Mask show={maskShow} onHide={this.maskHideHandle}>
          <img src={sharedTip} className={common.maskShare} alt="右上角分享" />
        </Mask>
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

export default GotBonus;
