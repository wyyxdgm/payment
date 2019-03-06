import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, WhiteSpace } from 'antd-mobile';
import cs from 'classnames';

import QRCode from '@/components/QRCode';
import Mask from '@/components/Mask';
import Loading from '@/components/PageLoading';
import wxJsTicket from '@/utils/wxJsTicket';

import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import imgGzh from '@/assets/campaign1/gongzhonghao.png';
import 'swiper/dist/css/swiper.css';

import styles from './style.less';
import common from '@/pages/Campaign1/style.less';
import { ReactComponent as Shared } from '@/assets/campaign1/icon/shared.svg';

@connect(({ campaign1, loading }) => ({
  bonusAmount: campaign1.bonusAmount,
  bonusList: campaign1.bonusList,
  kgName: campaign1.kgName,
  loading: loading.effects['global/wxJsTicket'],
}))
class MarkSuccess extends PureComponent {
  state = { maskShareShow: false, maskMdmShow: false };

  componentWillMount() {
    const {
      kgName,
      location: { query },
    } = this.props;
    const { activityId } = query;

    const host = window.location.origin;
    wxJsTicket().then(wx => {
      const isContained = /(幼儿园|幼稚园)/.test(kgName);
      const share = {
        title: kgName
          ? `${kgName}${isContained ? '' : '幼儿园'}发福利，猪年给你送豪礼`
          : '分享出来就是让你戳进来领红包的',
        desc: '传递新年新财气，和谷春节送大礼',
        link: `${host}/mform/campaign1/patriarch?activityId=${activityId}`,
        imgUrl: host + sharedLinkIcon,
      };
      wx.onMenuShareAppMessage(share);
      wx.onMenuShareTimeline(share);
    });
  }

  // 分享遮罩关闭
  handleMaskShareHide = () => {
    this.setState({ maskShareShow: false });
  };

  // 面对面遮罩关闭
  handleMaskMdmHide = () => {
    this.setState({ maskMdmShow: false });
  };

  // 分享按钮响应
  handleShareClick = () => {
    this.setState({ maskShareShow: true });
  };

  // 面对面撒红包
  handleMdmClick = () => {
    this.setState({ maskMdmShow: true });
  };

  normal() {
    const { maskShareShow, maskMdmShow } = this.state;
    const {
      location: { query },
    } = this.props;
    const { activityId } = query;
    const host = window.location.origin;

    return (
      <div className={cs(styles.container, styles.markSuccess)}>
        <div className={styles.btnArea}>
          <Button onClick={this.handleShareClick}>
            <Shared fill="#9B1E23" className={common.iconShared} />
            <span>分享家长领红包</span>
          </Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleMdmClick}>面对面撒红包</Button>
        </div>

        <div className={styles.gzh}>
          <img src={imgGzh} alt="公众号" />
          <p>
            关注和谷学费宝公众号在我的-<span>进度查询</span>即可查看
          </p>
        </div>

        <Mask show={maskShareShow} marginTop="0" onHide={this.handleMaskShareHide}>
          <div className={common.maskShare}>
            <img src={sharedTip} alt="右上角分享" />
          </div>
        </Mask>

        <Mask show={maskMdmShow} height="11.293rem" onHide={this.handleMaskMdmHide}>
          <div className={styles.maskMdm}>
            <QRCode
              size={274}
              margin={10}
              text={`${host}/mform/campaign1/patriarch?type=1&activityId=${activityId}`}
            />
          </div>
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
