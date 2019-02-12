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
import regIcon from '@/assets/campaign1/regIcon.png';
import g1 from '@/assets/campaign1/guide/kg/1.png';
import g2 from '@/assets/campaign1/guide/kg/2.png';
import g4 from '@/assets/campaign1/guide/kg/4.png';
import g5 from '@/assets/campaign1/guide/kg/5.png';
import g6 from '@/assets/campaign1/guide/kg/6.png';
import g7 from '@/assets/campaign1/guide/kg/7.png';
import g8 from '@/assets/campaign1/guide/kg/8.png';
import g9 from '@/assets/campaign1/guide/kg/9.png';
import g10 from '@/assets/campaign1/guide/kg/10.png';
import g11 from '@/assets/campaign1/guide/kg/11.png';
import g12 from '@/assets/campaign1/guide/kg/12.png';
import g13 from '@/assets/campaign1/guide/kg/13.png';

import sharedTip from '@/assets/campaign1/shareTip.png';
import common from './style.less';

@connect(({ loading }) => ({
  loading: loading.effects['global/wxJsTicket'],
}))
class GuideForKG extends PureComponent {
  state = { maskShow: false };

  componentWillMount() {
    wxJsTicket().then(wx => {
      const {
        location: { query },
      } = this.props;
      const { activityId } = query;
      const host = window.location.origin;
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
    this.setState({ maskShow: true });
  };

  handleRegLink = () => {
    window.location.href = `https://agent.hoogoo.cn/apply/school.html?userId=0&agentId=1`;
  };

  normal() {
    const { maskShow } = this.state;
    return (
      <div className={cs(common.guide)}>
        <img src={g1} alt="红包攻略" />
        <img src={g2} alt="红包攻略" />
        <div className={cs(common.btnArea, common.kgBtnArea)}>
          <Button onClick={this.handleShareClick}>
            <Shared fill="#9B1E23" className={common.iconShared} />
            <span>分享红包给家长</span>
          </Button>
          <Button onClick={this.handleRegLink}>
            <img src={regIcon} className={common.iconReg} />
            <span>立即注册和谷学费宝</span>
          </Button>
        </div>
        <img src={g4} alt="红包攻略" />
        <img src={g5} alt="红包攻略" />
        <img src={g6} alt="红包攻略" />
        <img src={g7} alt="红包攻略" />
        <img src={g8} alt="红包攻略" />
        <img src={g9} alt="红包攻略" />
        <img src={g10} alt="红包攻略" />
        <img src={g11} alt="红包攻略" />
        <img src={g12} alt="红包攻略" />
        <img src={g13} alt="红包攻略" />

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

export default GuideForKG;
