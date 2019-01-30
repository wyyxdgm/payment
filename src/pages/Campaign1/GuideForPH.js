import React, { PureComponent } from 'react';
import { connect } from 'dva';
import cs from 'classnames';
import { Button } from 'antd-mobile';
import qs from 'qs';
import LazyLoad from 'react-lazy-load';
import Mask from '@/components/Mask';
import Loading from '@/components/PageLoading';
import wxJsTicket from '@/utils/wxJsTicket';

import { ReactComponent as Shared } from '@/assets/campaign1/icon/shared.svg';
import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import g1 from '@/assets/campaign1/guide/ph/1.png';
import g3 from '@/assets/campaign1/guide/ph/3.png';
import g4 from '@/assets/campaign1/guide/ph/4.png';
import g5 from '@/assets/campaign1/guide/ph/5.png';
import g6 from '@/assets/campaign1/guide/ph/6.png';
import g7 from '@/assets/campaign1/guide/ph/7.png';
import g8 from '@/assets/campaign1/guide/ph/8.png';
import g9 from '@/assets/campaign1/guide/ph/9.png';
import g10 from '@/assets/campaign1/guide/ph/10.png';
import g11 from '@/assets/campaign1/guide/ph/11.png';
import g12 from '@/assets/campaign1/guide/ph/12.png';
import g13 from '@/assets/campaign1/guide/ph/13.png';

import sharedTip from '@/assets/campaign1/shareTip.png';
import common from './style.less';

@connect(({ loading }) => ({
  loading: loading.effects['global/wxJsTicket'],
}))
class GuideForPH extends PureComponent {
  state = { maskShow: false };

  componentWillMount() {
    wxJsTicket().then(wx => {
      const {
        location: { query },
      } = this.props;
      const { activityId } = query;
      const host = window.location.origin;
      wx.onMenuShareAppMessage({
        title: '入驻和谷学费宝，你招生我送钱',
        desc: '稳固生源，资金安全，对账简单，园所升级不再难。',
        link: `${host}/mform/campaign1/guide-for-kg?${qs.stringify({ type: 2, activityId })}`,
        imgUrl: host + sharedLinkIcon,
      });
    });
  }

  maskHideHandle = () => {
    this.setState({ maskShow: false });
  };

  // 分享按钮响应
  handleShareClick = () => {
    this.setState({ maskShow: true });
  };

  normal() {
    const { maskShow } = this.state;

    return (
      <div className={cs(common.guide)}>
        <img src={g1} alt="红包攻略" />
        <div className={cs(common.btnArea, common.phBtnArea)}>
          <Button onClick={this.handleShareClick}>
            <Shared fill="#9B1E23" className={common.iconShared} />
            <span>联系园所为您开通</span>
          </Button>
        </div>
        <LazyLoad height="4.693rem">
          <img src={g3} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.68rem">
          <img src={g4} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.693rem">
          <img src={g5} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.693rem">
          <img src={g6} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.68rem">
          <img src={g7} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.693rem">
          <img src={g8} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.693rem">
          <img src={g9} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.68rem">
          <img src={g10} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.693rem">
          <img src={g11} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.68rem">
          <img src={g12} alt="红包攻略" />
        </LazyLoad>
        <LazyLoad height="4.693rem">
          <img src={g13} alt="红包攻略" />
        </LazyLoad>

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

export default GuideForPH;
