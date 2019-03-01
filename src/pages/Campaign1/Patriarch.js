import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Toast, WhiteSpace } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';
import Loading from '@/components/PageLoading';
import Mask from '@/components/Mask';
import wxJsTicket from '@/utils/wxJsTicket';
import wxToken from '@/utils/wxToken';

import { ReactComponent as Shared } from '@/assets/campaign1/icon/shared.svg';
import sharedTip from '@/assets/campaign1/shareTip.png';
import usedPhone from '@/assets/campaign1/used.png';
import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';

import styles from './style.less';
import common from '@/pages/Campaign1/style.less';

@connect(({ loading }) => ({
  loading: loading.effects['global/wxJsTicket'],
  bonusLoading: loading.effects['campaign1/getBonus'],
}))
class Patriarch extends PureComponent {
  state = { maskShareShow: false, maskPhoneUsedShow: false };

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const { code } = query;

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
    } else {
      const { activityId } = query;
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

      wxToken().then(() => {
        dispatch({
          type: 'campaign1/campaignStatus',
          payload: { activityId },
          callback: response => {
            if (response.code !== 200) {
              Toast.info(response.message, 3, null, false);
            }
          },
        });
      });
    }
  }

  // 领取红包
  handleGetBonus = () => {
    const {
      location: { query },
      dispatch,
    } = this.props;

    const { activityId, code } = query;

    const payload = {
      activityId: activityId * 1,
    };
    wxToken().then(() => {
      dispatch({
        type: 'campaign1/getBonus',
        payload,
        callback: response => {
          if (response.code === 200) {
            router.push(`got-bonus?activityId=${activityId}&code=${code}`);
          } else {
            Toast.info(response.message);
          }
        },
      });
    });
  };

  // 分享按钮响应
  handleShareClick = () => {
    this.setState({ maskShareShow: true});
  };

  handleMaskShare = () => {
    this.setState({ maskShareShow: false });
  };

  handleMaskPhoneUsed = () => {
    this.setState({ maskPhoneUsedShow: false });
  };

  normal() {
    const { getBonusLoading } = this.props;

    const { maskShareShow, maskPhoneUsedShow } = this.state;

    return (
      <div className={cs(styles.container, styles.getBonus)}>
        <div className={styles.btnArea}>
          <Button
            onClick={this.handleGetBonus}
            loading={getBonusLoading}
            disabled={getBonusLoading}
          >
            <span>立即领取</span>
          </Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleShareClick}>
            <Shared fill="#9B1E23" className={styles.iconShared} />
            <span>分享给好友</span>
          </Button>
        </div>
        <div className={styles.gameRule}>
          <div className={styles.inner}>
            <h2>红包规则</h2>
            <ol>
              <li>领取成功后，请到和谷学费宝微信公众号的菜单栏中点击「我的」-【我的红包】中查看。</li>
              <li>红包可在支付学费时使用（所在幼儿园需提前开通和谷学费宝平台)。</li>
              <li>红包不与园所其他优惠叠加使用。</li>
              <li>红包不能提现，不能转赠他人，不能为他人领取。</li>
              <li>该活动最终解释权由和谷共创所有。</li>
              <li>如有其它疑问请咨询和谷客服：<a href="tel://4008109855">400-810-9855</a></li>
            </ol>
          </div>
        </div>
        <Mask show={maskShareShow} marginTop="0" onHide={this.handleMaskShare}>
          <div className={common.maskShare}>
            <img src={sharedTip} alt="右上角分享" />
          </div>
        </Mask>

        <Mask show={maskPhoneUsedShow} height="6.893rem" onHide={this.handleMaskPhoneUsed}>
          <div className={styles.maskUsedPhone}>
            <img src={usedPhone} alt="您已领过" />
          </div>
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

export default Patriarch;
