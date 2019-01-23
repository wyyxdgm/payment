import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, InputItem, List, Toast, WhiteSpace, Modal } from 'antd-mobile';
import { createForm } from 'rc-form';
import cs from 'classnames';
import wx from 'weixin-js-sdk';
import Loading from '@/components/PageLoading';
import WXShared from '@/components/WXShared';
import InputPhoneText from '@/components/InputPhoneText';
import { ReactComponent as Shared } from '@/assets/campaign1/icon/shared.svg';
import gameRule from '@/assets/campaign1/gameRule.png';

import styles from './style.less';

@connect(({ wxToken, loading }) => ({
  wxToken,
  loading: loading.effects['global/wxToken'],
  sharedLoading: loading.effects['global/wxShared'],
}))
@createForm()
class Patriarch extends PureComponent {
  state = { wxShared: false };

  validate = () => {
    const {
      form: { validateFields },
      dispatch,
      location: { query },
    } = this.props;

    validateFields((error, values) => {
      if (error) {
        Toast.info(Object.values(error)[0].errors[0].message, 3, null, false);
        return;
      }
      const payload = { ...values, payPhone: values.payPhone.replace(/\s/g, '') };
      dispatch({
        type: 'campaign1/getBonus',
        payload,
        callback: status => {
          if (status) {
            router.replace('coupon');
          } else {
            Modal.alert('已经抢过了', '该手机好已经抢过了，给别人留点吧');
          }
        },
      });
    });
  };

  // 发送验证码
  handlePhoneTextClick = phone => {
    const { dispatch } = this.props;

    dispatch({
      type: 'global/checkCode',
      payload: { phone },
    });
  };

  handleShareClick = () => {
    const { dispatch } = this.props;
    const host = 'http://testm.hoogoo.cn';

    dispatch({
      type: 'global/wxShared',
      payload: { shareUrl: host },
      callback: data => {
        this.setState({ wxShared: true });
        wx.config({
          debug: false,
          appId: data.appId,
          timestamp: parseInt(data.timestamp, 10),
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: ['onMenuShareAppMessage'],
        });

        wx.ready(() => {
          wx.onMenuShareAppMessage({
            title: '分享出来就是让你戳进来领红包的',
            desc: '传递新年新财气，和谷春节送大礼',
            link: `${host}/mform/campaign1/patriarch`,
            imgUrl: `${host}/images/share.png`,
          });
        });
      },
    });
  };

  wxSharedHideHandle = () => {
    this.setState({ wxShared: false });
  };

  normal() {
    const {
      form: { getFieldError, getFieldProps },
      submitting,
      sharedLoading,
    } = this.props;

    const { wxShared } = this.state;

    return (
      <div className={cs(styles.container, styles.getBonus)}>
        <List>
          <InputPhoneText
            placeholder="请输入缴费人手机号"
            onTextButtonClick={this.handlePhoneTextClick}
            error={getFieldError('payPhone')}
            {...getFieldProps('payPhone', {
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
          <Button onClick={this.validate} loading={submitting} disabled={submitting}>
            <span>立即领取</span>
          </Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleShareClick} loading={sharedLoading} disabled={sharedLoading}>
            <Shared fill="#9B1E23" className={styles.iconShared} />
            <span>分享给好友</span>
          </Button>
        </div>
        <div className={styles.gameRule}>
          <img src={gameRule} alt="红包规则" />
        </div>
        <WXShared show={wxShared} onHide={this.wxSharedHideHandle} />
      </div>
    );
  }

  render() {
    const { loading } = this.props;
    return loading ? <Loading /> : this.normal();
  }
}

export default Patriarch;
