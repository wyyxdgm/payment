import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, WhiteSpace } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';

import QRCode from '@/components/QRCode';
import Mask from '@/components/Mask';
import Loading from '@/components/PageLoading';
import wxJsTicket from '@/utils/wxJsTicket';

import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import imgGzh from '@/assets/campaign1/gongzhonghao.png';
import 'swiper/dist/css/swiper.css';

import styles from './style.less';

@connect(({ campaign1, loading }) => ({
  bonusAmount: campaign1.bonusAmount,
  bonusList: campaign1.bonusList,
  kgName: campaign1.kgName,
  loading: loading.effects['global/wxToken'] || loading.effects['global/wxJsTicket'],
}))
class MarkSuccess extends PureComponent {
  state = { maskShow: false, maskContent: 'share' };

  componentWillMount() {
    const {
      kgName,
      location: { query },
    } = this.props;
    const { activityId } = query;

    const host = window.location.origin;
    wxJsTicket().then(wx => {
      const isContained = /(幼儿园|幼稚园)/.test(kgName);
      wx.onMenuShareAppMessage({
        title: kgName
          ? `${kgName}${isContained ? '' : '幼儿园'}发福利，猪年给你送豪礼`
          : '分享出来就是让你戳进来领红包的',
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
    this.setState({ maskShow: true, maskContent: 'share' });
  };

  // 面对面撒红包
  handleMdmClick = () => {
    this.setState({ maskShow: true, maskContent: 'mdm' });
  };

  normal() {
    const { maskShow, maskContent } = this.state;
    const {
      location: { query },
    } = this.props;
    const { activityId } = query;
    const host = window.location.origin;

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
            关注和谷学费宝公众号在我的-<span>进度查询</span>即可查看
          </p>
        </div>

        <Mask show={maskShow} onHide={this.maskHideHandle}>
          {maskContent === 'share' && (
            <img src={sharedTip} className={styles.maskShare} alt="右上角分享" />
          )}
          {maskContent === 'mdm' && (
            <div className={styles.maskMdm}>
              <QRCode
                size={274}
                margin={10}
                text={`${host}/mform/campaign1/patriarch?type=1&activityId=${activityId}`}
              />
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
