import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, WhiteSpace, Toast, InputItem, List } from 'antd-mobile';
import cs from 'classnames';
import qs from 'qs';
import router from 'umi/router';
import Link from 'umi/link';
import { createForm } from 'rc-form';
import Mask from '@/components/Mask';
import Loading from '@/components/PageLoading';
import InputPhoneText from '@/components/InputPhoneText';
import wxJsTicket from '@/utils/wxJsTicket';
import wxToken from '@/utils/wxToken';

import BonusSwipe from './BonusSwip';
import sharedLinkIcon from '@/assets/campaign1/sharedLinkIcon.png';
import sharedTip from '@/assets/campaign1/shareTip.png';
import imgGuide from '@/assets/campaign1/bonusGuide.png';

import imgGzh from '@/assets/campaign1/gongzhonghao.png';
import 'swiper/dist/css/swiper.css';
import common from './style.less';
import styles from './GotBonus.less';

@connect(({ campaign1, global, loading }) => ({
  bonusAmount: campaign1.bonusAmount,
  bonusList: campaign1.bonusList,
  mobileBound: global.mobileBound,
  loading:
    loading.effects['global/wxToken'] ||
    loading.effects['global/wxJsTicket'] ||
    loading.effects['campaign1/bonusList'] ||
    loading.effects['global/isMobileBind'],
  bindTelLoading: loading.effects['global/bindMobile'],
}))
@createForm()
class GotBonus extends PureComponent {
  state = { maskShow: false, bindMaskShow: false };

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const { code, activityId } = query;

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
    } else if (activityId) {
      wxToken().then(() => {
        dispatch({ type: 'campaign1/bonusList', payload: { activityId } });
        // 判断当前微信是否绑定手机号
        dispatch({ type: 'global/isMobileBind', payload: { type: 1 } });
      });
      wxJsTicket().then(wx => {
        const host = window.location.origin;
        wx.onMenuShareAppMessage({
          title: '分享出来就是让你戳进来领红包的',
          desc: '传递新年新财气，和谷春节送大礼',
          link: `${host}/mform/campaign1/patriarch?activityId=${activityId}`,
          imgUrl: host + sharedLinkIcon,
        });
      });
    } else {
      Toast.info('请指定一个优惠活动');
    }
  }

  // 关联手机号
  validate = () => {
    const {
      location: { query },
      form: { validateFields },
      dispatch,
    } = this.props;

    const { activityId, code } = query;

    validateFields((error, values) => {
      if (error) {
        Toast.info(Object.values(error)[0].errors[0].message, 3, null, false);
        return;
      }
      const payload = {
        ...values,
        mobile: values.mobile.replace(/\s/g, ''),
        type: 1,
      };
      wxToken().then(() => {
        dispatch({
          type: 'global/bindMobile',
          payload,
          callback: response => {
            if (response.code !== 200) {
              Toast.info(response.message, 3, null, false);
            } else {
              router.push(`bonus?activityId=${activityId}&code=${code}`);
            }
          },
        });
      });
    });
  };

  maskHideHandle = () => {
    this.setState({ maskShow: false });
  };

  handleBindMaskHide = fromChildren => {
    if (!fromChildren) {
      this.setState({ bindMaskShow: false });
    }
  };

  // 分享按钮响应
  handleShareClick = () => {
    this.setState({ maskShow: true });
  };

  // 使用红包按钮响应
  handleUseBonus = () => {
    const {
      location: { query },
      mobileBound,
    } = this.props;
    const { activityId, code } = query;
    if (mobileBound) {
      router.push(`bonus?activityId=${activityId}&code=${code}`);
    } else {
      this.setState({ bindMaskShow: true });
    }
  };

  // 发送验证码
  handlePhoneTextClick = mobile => {
    const { dispatch } = this.props;

    dispatch({
      type: 'global/wxCheckCode',
      payload: { mobile, type: 2 },
      callback: response => {
        if (response.code === 200) {
          Toast.info(response.data, 3, null, false);
        }
      },
    });
  };

  normal() {
    const { maskShow, bindMaskShow } = this.state;
    const {
      form: { getFieldError, getFieldProps },
      location: { query },
      bonusAmount,
      bonusList,
      bindTelLoading,
    } = this.props;
    const { activityId } = query;

    return (
      <div className={cs(styles.container)}>
        <div className={styles.amount}>{bonusAmount}</div>
        <Link className={styles.link} to={`guide-for-ph?${qs.stringify({ activityId })}`}>
          *使用红包攻略 GO&gt;
        </Link>
        <BonusSwipe data={bonusList} />
        <div className={styles.guide}>
          <img src={imgGuide} alt="红包使用攻略" />
        </div>

        <div className={common.btnArea}>
          <Button onClick={this.handleShareClick}>分享给好友</Button>
          <WhiteSpace size="xl" />
          <Button onClick={this.handleUseBonus}>使用红包</Button>
        </div>

        <div className={common.gzh}>
          <img src={imgGzh} alt="公众号" />
          <p>
            关注和谷学费宝公众号在我的-<span>我的红包</span>即可查看
          </p>
        </div>

        <Mask show={maskShow} marginTop="0" onHide={this.maskHideHandle}>
          <div className={common.maskShare}>
            <img src={sharedTip} alt="右上角分享" />
          </div>
        </Mask>

        <Mask show={bindMaskShow} height="7.36rem" showClose onHide={this.handleBindMaskHide}>
          <div className={styles.bindTel}>
            <List>
              <InputPhoneText
                placeholder="请输入手机号"
                buttonCls={styles.code}
                onTextButtonClick={this.handlePhoneTextClick}
                error={getFieldError('mobile')}
                {...getFieldProps('mobile', {
                  rules: [
                    { required: true, message: '请输入手机号' },
                    { len: 13, message: '请输入正确的手机号' },
                  ],
                })}
              />
              <div>
                <InputItem
                  type="tel"
                  placeholder="请输入验证码"
                  labelNumber={2}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  size=""
                  clear
                  error={getFieldError('checkCode')}
                  {...getFieldProps('checkCode', {
                    rules: [{ required: true, message: '请输入手机验证码' }],
                  })}
                />
              </div>
            </List>
            <div className={styles.btnArea}>
              <Button onClick={this.validate} loading={bindTelLoading} disabled={bindTelLoading}>
                确定
              </Button>
            </div>
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

export default GotBonus;
