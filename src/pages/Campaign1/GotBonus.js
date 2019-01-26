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
  ph: `/mform/campaign1/mark?`,
};
const imgUrl = {
  kg: sharedLinkIconKg,
  ph: sharedLinkIcon,
};
const typeMap = {
  kg: 2,
  ph: 1,
};

// 切换幼儿园和家长分享 sort: kg | ph
function sharedContent(sort) {
  const query = getPageQuery();
  const host = window.location.origin;
  const { activityId } = query;
  return {
    title: title[sort],
    desc: desc[sort],
    link: host + link[sort] + qs.stringify({ type: typeMap[sort], activityId }),
    imgUrl: host + imgUrl[sort],
  };
}

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
    const { activityId } = query;

    if (activityId) {
      wxToken().then(() => {
        dispatch({ type: 'campaign1/bonusList', payload: { activityId } });
      });
    } else {
      Toast.info('请指定一个优惠活动');
    }
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

  render() {
    const { loading } = this.props;
    return loading ? <Loading /> : this.normal();
  }
}

export default GotBonus;
