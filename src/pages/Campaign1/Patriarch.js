import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, InputItem, List, Toast, WhiteSpace } from 'antd-mobile';
import { createForm } from 'rc-form';
import cs from 'classnames';
import qs from 'qs';
import Loading from '@/components/PageLoading';
import Mask from '@/components/Mask';
import InputPhoneText from '@/components/InputPhoneText';
import wxJsTicket from '@/utils/wxJsTicket';

import { ReactComponent as Shared } from '@/assets/campaign1/icon/shared.svg';
import gameRule from '@/assets/campaign1/gameRule.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import usedPhone from '@/assets/campaign1/used.png';
import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';

import styles from './style.less';

@connect(({ loading }) => ({
  loading: loading.effects['global/wxToken'] || loading.effects['global/wxJsTicket'],
  bonusLoading: loading.effects['campaign1/getBonus'],
}))
@createForm()
class Patriarch extends PureComponent {
  state = { maskShow: false, maskContent: 'share' };

  componentWillMount() {
    const {
      location: { query },
    } = this.props;
    const { code } = query;

    if (!code) {
      const { type, activityId } = query;
      const payload = {
        appid: process.env.APP_ID,
        redirect_uri: window.location.href,
        response_type: 'code',
        scope: 'snsapi_userinfo',
        state: qs.stringify({ type, activityId }),
      };
      window.location.replace(
        `https://open.weixin.qq.com/connect/oauth2/authorize?${qs.stringify(
          payload
        )}#wechat_redirect`
      );
    } else {
      wxJsTicket().then(wx => {
        const host = window.location.origin;
        const { type, activityId } = query;
        wx.onMenuShareAppMessage({
          title: '分享出来就是让你戳进来领红包的',
          desc: '传递新年新财气，和谷春节送大礼',
          link: `${host}/mform/campaign1/patriarch?${qs.stringify({ type, activityId })}`,
          imgUrl: host + sharedLinkIcon,
        });
      });
    }
  }

  // 领取红包
  validate = () => {
    const {
      location: { query },
      form: { validateFields },
      dispatch,
    } = this.props;

    const { type, activityId } = query;

    validateFields((error, values) => {
      if (error) {
        Toast.info(Object.values(error)[0].errors[0].message, 3, null, false);
        return;
      }
      const payload = {
        ...values,
        mobile: values.mobile.replace(/\s/g, ''),
        activityId: activityId * 1,
      };
      dispatch({
        type: 'campaign1/getBonus',
        payload,
        callback: response => {
          if (response.code === 200) {
            router.replace(`patriarch/got-bonus?${qs.stringify({ type, activityId })}`);
          } else {
            this.setState({ maskShow: true, maskContent: 'phone-used' });
          }
        },
      });
    });
  };

  // 发送验证码
  handlePhoneTextClick = mobile => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/wxCheckCode',
      payload: { mobile, type: 1 },
    });
  };

  // 分享按钮响应
  handleShareClick = () => {
    this.setState({ maskShow: true, maskContent: 'share' });
  };

  maskHideHandle = () => {
    this.setState({ maskShow: false });
  };

  normal() {
    const {
      form: { getFieldError, getFieldProps },
      getBonusLoading,
    } = this.props;

    const { maskShow, maskContent } = this.state;

    return (
      <div className={cs(styles.container, styles.getBonus)}>
        <List>
          <InputPhoneText
            placeholder="请输入缴费人手机号"
            onTextButtonClick={this.handlePhoneTextClick}
            error={getFieldError('mobile')}
            {...getFieldProps('mobile', {
              rules: [
                { required: true, message: '请输入缴费人手机号' },
                { len: 13, message: '请输入正确的手机号' },
              ],
            })}
          />
          <InputItem
            placeholder="请输入手机验证码"
            labelNumber={2}
            maxLength="6"
            clear
            error={getFieldError('checkCode')}
            {...getFieldProps('checkCode', {
              rules: [{ required: true, message: '请输入手机验证码' }],
            })}
          />
        </List>
        <WhiteSpace size="xl" />
        <div className={styles.btnArea}>
          <Button onClick={this.validate} loading={getBonusLoading} disabled={getBonusLoading}>
            <span>立即领取</span>
          </Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleShareClick}>
            <Shared fill="#9B1E23" className={styles.iconShared} />
            <span>分享给好友</span>
          </Button>
        </div>
        <div className={styles.gameRule}>
          <img src={gameRule} alt="红包规则" />
        </div>
        <Mask show={maskShow} onHide={this.maskHideHandle}>
          {maskContent === 'share' && (
            <img src={sharedTip} className={styles.maskShare} alt="右上角分享" />
          )}
          {maskContent === 'phone-used' && (
            <div className={styles.maskUsedPhone}>
              <img src={usedPhone} alt="您已领过" />
            </div>
          )}
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
