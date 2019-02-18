import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List, InputItem, WhiteSpace, Button, Toast, Flex, Icon } from 'antd-mobile';
import { createForm } from 'rc-form';
import qs from 'qs';
import router from 'umi/router';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import Loading from '@/components/PageLoading';
import InputPhoneText from '@/components/InputPhoneText';
import { isWeChat } from '@/utils/userAgent';
import InputSelect from '@/components/InputSelect';
import Staging from './Staging';
import Bonus from './Bonus';
import { ReactComponent as Student } from '@/assets/icon/xuesheng.svg';
import { ReactComponent as Pay } from '@/assets/icon/jiaofeiren.svg';
import { ReactComponent as Phone } from '@/assets/icon/shouji.svg';
import { ReactComponent as Spacer } from '@/assets/icon/spacer.svg';

import styles from './style.less';

@connect(({ tuition, loading }) => ({
  summary: tuition.summary,
  staging: tuition.staging,
  students: tuition.students,
  bonus: tuition.bonus,
  submitting: loading.effects['tuition/submit'],
  detailLoading: loading.effects['tuition/detail'],
}))
@createForm()
class Tuition extends PureComponent {
  constructor(props) {
    super(props);

    this.defaultPayType = 2;
    if (!isWeChat()) {
      this.defaultPayType = 1;
    }
    // 支付方法 1 支付宝，2 微信, 5 寺库
    this.state = {
      payType: this.defaultPayType,
      bonusId: -1,
      bonusName: '',
      bonusAmount: 0,
      bonusShow: false,
    };
  }

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;

    const { formId, classId, code, state } = query;
    if ((isWeChat() && !(code && state)) || !isWeChat()) {
      // 微信未认证，或者其他客户端访问，就走这里
      localStorage.setItem('id', query.formId);
      if (formId) {
        dispatch({ type: 'tuition/detail', payload: { id: formId } });
      }
      if (classId) {
        dispatch({ type: 'tuition/student', payload: { classId } });
      }
    } else if (isWeChat()) {
      // 微信访问，并且是授权后跳转回来，这里走微信支付流程
      const [orderNo, typeId, kindergartenId] = state.split('|');
      // 通过得到的code取openid
      dispatch({
        type: 'tuition/openId',
        payload: { code, kindergartenId },
        callback: openid => {
          dispatch({
            type: 'tuition/getFormInfo',
            payload: {
              orderNo,
              typeId,
              openid,
              kindergartenId,
            },
            callback: data => this.revokeWeChat(data),
          });
        },
      });
    }
  }

  // 根据分期ID得到红包列表
  @Debounce(500)
  getAvailableBonus() {
    const { dispatch } = this.props;
    const { payType } = this.state;
    if (payType === 5) {
      dispatch({
        type: 'tuition/availableBonus',
        payload: { payTypeId: this.typeId },
      });
    } else {
      dispatch({
        type: 'tuition/clearBonus',
      });
    }
  }

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

      const { payType } = this.state;
      const { student, ...newValues } = values;
      const couponId = this.state.bonusId; // eslint-disable-line
      const payload = {
        payType,
        ...newValues,
        studentName: values.student.label,
        studentId: values.student.value,
        typeId: this.typeId,
        classId: query.classId,
        className: query.className,
        payPhone: values.mobile.replace(/\s/g, ''),
        couponId,
      };

      if (payType === 5) {
        window.location.href = `https://m.hoogoo.cn/ajax/pay/pay/payment?${qs.stringify(
          payload
        )}`;
      } else {
        dispatch({
          type: 'tuition/submit',
          payload,
          callback: responseData => {
            if (payType === 1) {
              document.body.innerHTML = responseData;
              document.forms[0].submit();
            } else if (payType === 2) {
              this.oauth(responseData, this.typeId);
            }
          },
        });
      }
    });
  };

  // 缴费方式选择响应
  handleStagingChange = item => {
    const payType = item.type === 2 ? 5 : this.defaultPayType;
    this.typeId = item.id;
    this.setState({ payType, bonusId: -1, bonusAmount: 0 }, this.getAvailableBonus);
  };

  // 发送验证码
  handlePhoneTextClick = mobile => {
    const { dispatch } = this.props;

    dispatch({
      type: 'global/wxCheckCode',
      payload: { mobile, type: 1 },
      callback: response => {
        if (response.code === 200) {
          Toast.info(response.data, 3, null, false);
        }
      },
    });
  };

  // 红包列表选择响应
  handleBonusChange = data => {
    this.setState({
      bonusId: data.userCouponId,
      bonusName: data.couponName,
      bonusAmount: data.couponAmount,
      bonusShow: false,
    });
  };

  // 红包列表隐藏响应
  handleBonusShow = () => {
    const { bonus } = this.props;
    if (bonus.length > 0) {
      this.setState({ bonusShow: true });
    }
  };

  // 红包列表隐藏响应
  handleBonusHide = () => {
    this.setState({ bonusShow: false });
  };

  // 检测短信验证码输入情况，如果验证码输入合法，则进行登录
  @Bind()
  @Debounce(200)
  handleCodeKeyPress() {
    const {
      form: { getFieldValue },
      dispatch,
    } = this.props;

    const checkCode = getFieldValue('checkCode');
    if (this.checkCode === checkCode || checkCode.length !== 6) {
      return;
    }
    this.checkCode = checkCode;

    const mobile = (getFieldValue('mobile') || '').replace(/\s/g, '');
    if (mobile.length < 11) {
      return;
    }

    dispatch({
      type: 'tuition/login',
      payload: { mobile, checkCode },
      callback: response => {
        if (response.code === 200) {
          this.getAvailableBonus();
        } else {
          // 验证码错误
          Toast.info(response.message, 3, null, false);
        }
      },
    });
  }

  // 微信授权，会使页面重定向
  oauth(orderNo, typeId) {
    const {
      dispatch,
      location: { query },
    } = this.props;

    const { kindergartenId } = query;

    dispatch({
      type: 'tuition/appId',
      payload: { kindergartenId },
      callback: content => {
        if (!content) {
          return;
        }
        const { weChatAPPID } = JSON.parse(content);
        const payload = {
          appid: weChatAPPID,
          redirect_uri: window.location.href,
          response_type: 'code',
          scope: 'snsapi_base',
          state: `${orderNo}|${typeId}|${kindergartenId}`,
        };
        window.location.replace(
          `https://open.weixin.qq.com/connect/oauth2/authorize?${qs.stringify(
            payload
          )}#wechat_redirect`
        );
        // 重新跳转回来后处理的逻辑在componentWillMount里
      },
    });
  }

  revokeWeChat(data) {
    try {
      this.wakeup(data);
    } catch (e) {
      document.addEventListener('WeixinJSBridgeReady', () => {
        this.wakeup(data);
      });
    }
  }

  wakeup(data) {
    const { dispatch } = this.props;
    window.WeixinJSBridge.invoke(
      'getBrandWCPayRequest',
      {
        appId: data.appid, // 公众号名称，由商户传入
        timeStamp: data.timeStamp, // 时间戳，自1970年以来的秒数
        nonceStr: data.nonceStr, // 随机串
        package: data.package,
        signType: data.signType, // 微信签名方式：
        paySign: data.paySign, // 微信签名
      },
      res => {
        // eslint-disable-next-line default-case
        switch (res.err_msg) {
          case 'get_brand_wcpay_request:cancel':
            dispatch({ type: 'global/result', payload: { status: 'cancel', message: '' } });
            router.replace('/result/pay-cancel');
            break;
          case 'get_brand_wcpay_request:fail':
            dispatch({ type: 'global/result', payload: { status: 'fail', message: '' } });
            router.replace('/result/pay-fail');
            break;
          case 'get_brand_wcpay_request:ok':
            window.location.href = 'https://m.hoogoo.cn/PaySuccess';
        }
      }
    );
  }

  normal() {
    const { bonusShow, bonusId, bonusName, bonusAmount } = this.state;
    const {
      form: { getFieldProps, getFieldError },
      summary,
      staging,
      students,
      bonus,
      submitting,
      location: { query },
    } = this.props;
    const { name } = summary;

    return (
      <div className={styles.container}>
        <div className={styles.title}>{`${name} - ${query.className}`}</div>
        <WhiteSpace size="lg" />
        学生信息
        <WhiteSpace size="lg" />
        <List>
          <InputSelect
            dataSource={students}
            placeholder="请输入学生姓名"
            icon={<Student width="20" fill="#3F73DA" />}
            error={getFieldError('student')}
            {...getFieldProps('student', {
              rules: [{ required: true, message: '请输入学生姓名' }],
            })}
          >
            选择已有学生
          </InputSelect>
          <InputItem
            placeholder="请输入缴费人姓名"
            labelNumber={2}
            maxLength="20"
            error={getFieldError('payName')}
            {...getFieldProps('payName', {
              rules: [{ required: true, message: '请输入缴费人姓名' }],
            })}
          >
            <Pay width="20" fill="#3F73DA" />
          </InputItem>
          <InputPhoneText
            placeholder="请输入缴费人手机号"
            icon={<Phone width="20" fill="#3F73DA" />}
            buttonCls={styles.code}
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
            type="tel"
            placeholder="请输入验证码"
            labelNumber={2}
            maxLength="6"
            pattern="[0-9]{6}"
            clear
            onInput={this.handleCodeKeyPress}
            error={getFieldError('checkCode')}
            {...getFieldProps('checkCode', {
              rules: [{ required: true, message: '请输入验证码' }],
            })}
          >
            <Spacer />
          </InputItem>
        </List>
        <WhiteSpace size="lg" />
        缴费方式
        <WhiteSpace size="lg" />
        <div className={styles.staging}>
          <Staging data={staging} onChange={this.handleStagingChange} bonusAmount={bonusAmount} />
          <Flex justify="between" className={styles.coupon} onClick={this.handleBonusShow}>
            <div>使用优惠券</div>
            <div>
              {bonusId === -1 && bonus.length === 0 && <span>暂无可用优惠券</span>}
              {bonusId === -1 && bonus.length > 0 && <span style={{ color: '#eb5d35' }}>{bonus.length} 张优惠券可使用</span>}
              {bonusId !== -1 && <span style={{ color: '#eb5d35' }}>{bonusName}</span>}
              <Icon type="right" />
            </div>
          </Flex>
        </div>
        <WhiteSpace />
        <div className={styles.btnArea}>
          <Button onClick={this.validate} loading={submitting}>
            立即支付
          </Button>
        </div>
        <Bonus
          data={bonus}
          show={bonusShow}
          onChange={this.handleBonusChange}
          onHide={this.handleBonusHide}
        />
      </div>
    );
  }

  render() {
    const { detailLoading } = this.props;
    return detailLoading === undefined || detailLoading ? <Loading /> : this.normal();
  }
}

export default Tuition;
