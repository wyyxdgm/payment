import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, WhiteSpace } from 'antd-mobile';
import cs from 'classnames';
import wx from 'weixin-js-sdk';
import qs from 'qs';
import Mask from '@/components/Mask';
import BonusSwipe from './BonusSwip';
import sharedLinkIconKg from '@/assets/campaign1/sharedLinkIconKg.png';
import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import imgGuide from '@/assets/campaign1/bonusGuide.png';
import imgGzh from '@/assets/campaign1/gongzhonghao.png';
import 'swiper/dist/css/swiper.css';

import common from './style.less';
import styles from './bonus.less';

@connect(({ loading }) => ({
  loading: loading.effects['global/wxToken'],
  sharedLoading: loading.effects['global/wxShared'],
  getBonusLoading: loading.effects['campaign1/getBonus'],
}))
class Bonus extends PureComponent {
  state = { maskShow: false, kgShare: false, phShare: false };

  maskHideHandle = () => {
    this.setState({ maskShow: false });
  };

  // 分享按钮响应
  handleShareClick = sort => () => {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const host = window.location.origin;
    const { type, activityId } = query;

    if (sort === 'kg') {
      this.setState({ kgShare: true });
    } else {
      this.setState({ phShare: true });
    }
    dispatch({
      type: 'global/wxShared',
      payload: { shareUrl: host + window.location.pathname },
      callback: data => {
        this.setState({ maskShow: true });
        wx.config({
          debug: false,
          appId: data.appId,
          timestamp: parseInt(data.timestamp, 10),
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: ['onMenuShareAppMessage'],
        });
        const title = {
          kg: '标记园所送福利，先到先得很给力',
          ph: '分享出来就是让你戳进来领红包的',
        }[sort];
        const desc = {
          kg: '标记你的幼儿园，送你百万福利！我来出，你来撒～',
          ph: '传递新年新财气，和谷春节送大礼',
        }[sort];
        const link = {
          kg: `${host}/mform/campaign1/kindergarten?${qs.stringify({ type, activityId })}`,
          ph: `${host}/mform/campaign1/patriarch?${qs.stringify({ type, activityId })}`,
        }[sort];
        const imgUrl = {
          kg: host + sharedLinkIconKg,
          ph: host + sharedLinkIcon,
        }[sort];
        if (sort === 'kg') {
          this.setState({ kgShare: false });
        } else {
          this.setState({ phShare: false });
        }

        wx.ready(() => {
          wx.onMenuShareAppMessage({
            title,
            desc,
            link,
            imgUrl,
          });
        });
      },
    });
  };

  render() {
    const { sharedLoading } = this.props;
    const { maskShow, kgShare, phShare } = this.state;

    return (
      <div className={cs(styles.container)}>
        <div className={styles.amount}>2620</div>
        <BonusSwipe />
        <div className={styles.guide}>
          <img src={imgGuide} alt="交学费攻略" />
        </div>

        <div className={common.btnArea}>
          <Button
            onClick={this.validate}
            loading={sharedLoading && phShare}
            disabled={sharedLoading && phShare}
          >
            分享给好友
          </Button>
          <WhiteSpace size="xl" />
          <Button
            onClick={this.handleShareClick}
            loading={sharedLoading && kgShare}
            disabled={sharedLoading && kgShare}
          >
            分享给幼儿园
          </Button>
        </div>

        <div className={common.gzh}>
          <img src={imgGzh} alt="公众号" />
          <p>关注和谷学费宝公众号在我的-<span>我的红包</span>即可查看</p>
        </div>

        <Mask show={maskShow} onHide={this.maskHideHandle}>
          <img src={sharedTip} className={common.maskShare} alt="右上角分享" />
        </Mask>
      </div>
    );
  }
}

export default Bonus;
