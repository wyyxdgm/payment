import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, WhiteSpace, Toast } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';
import router from 'umi/router';
import Link from 'umi/link';
import Mask from '@/components/Mask';
import Loading from '@/components/PageLoading';
import wxJsTicket from '@/utils/wxJsTicket';
import wxToken from '@/utils/wxToken';

import BonusSwipe from './BonusSwip';
import BindMobile from './components/BindMobile';
import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import imgGuide from '@/assets/campaign1/bonusGuide.png';

import imgGzh from '@/assets/campaign1/gongzhonghao.png';
import 'swiper/dist/css/swiper.css';
import common from './style.less';
import styles from './GotBonus.less';

@connect(({ campaign1, global, loading }) => ({
  bonusAmount: campaign1.bonusAmount,
  bonusList: campaign1.bonusList,
  mobileBound: global.mobileBound,
  loading:
    loading.effects['global/wxToken'] ||
    loading.effects['global/wxJsTicket'] ||
    loading.effects['campaign1/bonusList'] ||
    loading.effects['global/isMobileBind'],
}))
class GotBonus extends PureComponent {
  state = { maskShow: false, bindMaskShow: false };

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
        // 判断当前微信是否绑定手机号
        dispatch({ type: 'global/isMobileBind', payload: { type: 1 } });
      });
      wxJsTicket().then(wx => {
        const host = window.location.origin;
        const share = {
          title: '分享出来就是让你戳进来领红包的',
          desc: '传递新年新财气，和谷春节送大礼',
          link: `${host}/mform/campaign1/patriarch?activityId=${activityId}`,
          imgUrl: host + sharedLinkIcon,
        };
        wx.onMenuShareAppMessage(share);
        wx.onMenuShareTimeline(share);
      });
    } else {
      Toast.info('请指定一个优惠活动');
    }
  }

  maskHideHandle = () => {
    this.setState({ maskShow: false });
  };

  // 关联手机号结果响应
  handleBind = error => {
    const {
      location: { query },
    } = this.props;

    const { activityId, code } = query;
    if (!error) {
      router.push(`bonus?activityId=${activityId}&code=${code}`);
    }
  };

  // 绑定手机组建消失响应
  handleBindHide = fromChildren => {
    if (!fromChildren) {
      this.setState({ bindMaskShow: false });
    }
  };

  // 分享按钮响应
  handleShareClick = () => {
    this.setState({ maskShow: true });
  };

  // 使用红包按钮响应
  handleUseBonus = () => {
    const {
      location: { query },
      mobileBound,
    } = this.props;
    const { activityId, code } = query;
    if (mobileBound) {
      router.push(`bonus?activityId=${activityId}&code=${code}`);
    } else {
      this.setState({ bindMaskShow: true });
    }
  };

  normal() {
    const { maskShow, bindMaskShow } = this.state;
    const {
      location: { query },
      bonusAmount,
      bonusList,
    } = this.props;
    const { activityId } = query;

    return (
      <div className={cs(styles.container)}>
        <div className={styles.amount}>{bonusAmount}</div>
        <Link className={styles.link} to={`guide-for-ph?${qs.stringify({ activityId })}`}>
          *使用红包说明
        </Link>
        <BonusSwipe data={bonusList} />
        <div className={styles.guide}>
          <img src={imgGuide} alt="红包使用攻略" />
        </div>

        <div className={common.btnArea}>
          <Button onClick={this.handleShareClick}>分享给好友</Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleUseBonus}>使用红包</Button>
        </div>

        <div className={common.gzh}>
          <img src={imgGzh} alt="公众号" />
          <p>
            关注和谷学费宝公众号在我的-<span>我的红包</span>即可查看
          </p>
        </div>

        <Mask show={maskShow} marginTop="0" onHide={this.maskHideHandle}>
          <div className={common.maskShare}>
            <img src={sharedTip} alt="右上角分享" />
          </div>
        </Mask>

        <BindMobile show={bindMaskShow} onBind={this.handleBind} onHide={this.handleBindHide} />
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
