import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, WhiteSpace } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';
import Mask from '@/components/Mask';
import { getPageQuery } from '@/utils/utils';
import BonusSwipe from './BonusSwip';

import sharedLinkIconKg from '@/assets/campaign1/sharedLinkIconKg.png';
import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import imgGuide from '@/assets/campaign1/bonusGuide.png';
import imgGzh from '@/assets/campaign1/gongzhonghao.png';
import 'swiper/dist/css/swiper.css';

import common from './style.less';
import styles from './bonus.less';
import wxJsTicket from '@/utils/wxJsTicket';

const title = {
  kg: '标记园所送福利，先到先得很给力',
  ph: '分享出来就是让你戳进来领红包的',
};
const desc = {
  kg: '标记你的幼儿园，送你百万福利！我来出，你来撒～',
  ph: '传递新年新财气，和谷春节送大礼',
};
const link = {
  kg: `/mform/campaign1/kindergarten?`,
  ph: `/mform/campaign1/patriarch?`,
};
const imgUrl = {
  kg: sharedLinkIconKg,
  ph: sharedLinkIcon,
};

// 切换幼儿园和家长分享 sort: kg | ph
function sharedContent(sort) {
  const query = getPageQuery();
  const host = window.location.origin;
  const { type, activityId } = query;
  return {
    title: title[sort],
    desc: desc[sort],
    link: host + link[sort] + qs.stringify({ type, activityId }),
    imgUrl: host + imgUrl[sort],
  };
}

@connect(({ loading }) => ({
  loading: loading.effects['global/wxToken'] || loading.effects['global/wxJsTicket'],
  getBonusLoading: loading.effects['campaign1/getBonus'],
}))
class GotBonus extends PureComponent {
  state = { maskShow: false };

  componentWillMount() {
    const item = sharedContent('ph');
    wxJsTicket().then(wx => {
      wx.onMenuShareAppMessage(item);
    });
  }

  maskHideHandle = () => {
    this.setState({ maskShow: false });
  };

  // 分享按钮响应
  handleShareClick = sort => () => {
    this.setState({ maskShow: true });
    const item = sharedContent(sort);
    wxJsTicket().then(wx => {
      wx.onMenuShareAppMessage(item);
    });
  };

  render() {
    const { maskShow } = this.state;

    return (
      <div className={cs(styles.container)}>
        <div className={styles.amount}>2620</div>
        <BonusSwipe />
        <div className={styles.guide}>
          <img src={imgGuide} alt="红包使用攻略" />
        </div>

        <div className={common.btnArea}>
          <Button onClick={this.handleShareClick('ph')}>分享给好友</Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleShareClick('kg')}>分享给幼儿园</Button>
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
}

export default GotBonus;
