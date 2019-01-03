import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List, InputItem, Radio, WhiteSpace, Picker, Button, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import qs from 'qs';
import router from 'umi/router';
import { isWeChat } from '@/utils/userAgent';
import Staging from './Staging';
import { ReactComponent as Student } from '@/assets/icon/xuesheng.svg';
import { ReactComponent as Pay } from '@/assets/icon/jiaofeiren.svg';
import { ReactComponent as Phone } from '@/assets/icon/shouji.svg';
import { ReactComponent as AliPay } from '@/assets/icon/zhifubao.svg';
import { ReactComponent as TenPay } from '@/assets/icon/weixinzhifu.svg';

import styles from './style.less';

@connect(({ tuition, loading }) => ({
  summary: tuition.summary,
  staging: tuition.staging,
  students: tuition.students,
  submitting: loading.effects['tuition/submit'],
}))
@createForm()
class Payment extends PureComponent {
  openId = '';

  constructor(props) {
    super(props);

    this.defaultPayType = 2;
    if (!isWeChat()) {
      this.defaultPayType = 1;
    }
    // 支付方法 1 支付宝，2 微信, 5 寺库
    this.state = { payType: this.defaultPayType, studentInputWay: 'input' };
  }

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;

    const { formId, code, classId, kindergartenId } = query;
    localStorage.setItem('id', query.formId);
    if (formId) {
      dispatch({ type: 'tuition/detail', payload: { id: formId } });
    }
    if (classId) {
      dispatch({ type: 'tuition/student', payload: { classId } });
    }
    // 微信客户端访问，如果没有得到code就跳微信转授权页面，微信会自动重定向携带code
    if (isWeChat()) {
      if (!code) {
        dispatch({
          type: 'tuition/appId',
          payload: { kindergartenId },
          callback: content => {
            const { weChatAPPID } = JSON.parse(content);
            const payload = {
              appid: weChatAPPID,
              redirect_uri: window.location.href,
              response_type: 'code',
              scope: 'snsapi_base',
              state: 'STATE',
            };
            window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${qs.stringify(
              payload
            )}#wechat_redirect`;
          },
        });
      } else {
        // 通过得到的code取openid
        dispatch({
          type: 'tuition/openId',
          payload: { code, kindergartenId },
          callback: responseData => {
            this.openId = responseData;
          },
        });
      }
    }
  }

  // 得到所有支付参数
  getWeChatParam(orderNo, typeId) {
    const {
      dispatch,
      location: { query },
    } = this.props;

    dispatch({
      type: 'tuition/getFormInfo',
      payload: {
        orderNo,
        typeId,
        openid: this.openId,
        kindergartenId: query.kindergartenId,
      },
      callback: data => this.revokeWeChat(data),
    });
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
      const payload = {
        payType,
        studentName: '',
        ...values,
        studentId: values.studentId ? values.studentId[0] : 0,
        typeId: this.typeId,
        className: query.className,
        payPhone: values.payPhone.replace(/\s/g, ''),
      };

      if (payType === 5) {
        window.location.href = `http://m.hoogoo.cn/ajax/pay/pay/payment?${qs.stringify(
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
              this.getWeChatParam(responseData, this.typeId);
            }
          },
        });
      }
    });
  };

  // 支付方式选择
  handleRadioChange = payType => () => {
    this.setState({ payType });
  };

  handleStudentInputWay = studentInputWay => () => {
    this.setState({ studentInputWay });
  };

  handleStagingChange = item => {
    this.typeId = item.id;
    this.setState({ payType: item.type === 2 ? 5 : this.defaultPayType });
  };

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
            window.location.href = 'http://m.hoogoo.cn/PaySuccess';
        }
      }
    );
  }

  render() {
    const {
      form: { getFieldProps, getFieldError },
      summary,
      staging,
      students,
      submitting,
      location: { query },
    } = this.props;
    const { payType, studentInputWay } = this.state;
    const { name } = summary;

    return (
      <div className={styles.container}>
        <div className={styles.title}>{`${name} - ${query.className}`}</div>
        <WhiteSpace size="lg" />
        学生信息
        <WhiteSpace size="lg" />
        <List>
          {studentInputWay === 'pick' && (
            <div className={styles.student}>
              <Picker
                extra="请选择学生"
                title="选择学生"
                data={students}
                cols={1}
                {...getFieldProps('studentId', {
                  rules: [{ required: true, message: '请选择学生' }],
                })}
              >
                <List.Item
                  thumb={<Student width="20" fill="#3F73DA" />}
                  error={getFieldError('studentId')}
                />
              </Picker>
              <a onClick={this.handleStudentInputWay('input')}>添加新生</a>
            </div>
          )}
          {studentInputWay === 'input' && (
            <div className={styles.student}>
              <div>
                <InputItem
                  placeholder="请输入学生姓名"
                  labelNumber={2}
                  maxLength="20"
                  error={getFieldError('studentName')}
                  {...getFieldProps('studentName', {
                    rules: [{ required: true, message: '请输入学生姓名' }],
                  })}
                >
                  <Student width="20" fill="#3F73DA" />
                </InputItem>
              </div>
              <a onClick={this.handleStudentInputWay('pick')}>选择学生</a>
            </div>
          )}
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
          <InputItem
            type="phone"
            placeholder="请输入缴费人手机号"
            labelNumber={2}
            error={getFieldError('payPhone')}
            {...getFieldProps('payPhone', {
              rules: [
                { required: true, message: '请输入缴费人手机号' },
                { len: 13, message: '请输入正确的手机号' },
              ],
            })}
          >
            <Phone width="20" fill="#3F73DA" />
          </InputItem>
        </List>
        <WhiteSpace size="lg" />
        缴费方式
        <WhiteSpace size="lg" />
        <div className={styles.staging}>
          <Staging data={staging} onChange={this.handleStagingChange} />
          {payType <= 2 ? <p>请选择支付方式</p> : <p />}
          <List className={styles.payList}>
            {!isWeChat() && payType <= 2 && (
              <Radio.RadioItem
                thumb={<AliPay width="20" fill="#4BA7E8" />}
                checked={payType === 1}
                onChange={this.handleRadioChange(1)}
              >
                支付宝支付
              </Radio.RadioItem>
            )}
            {isWeChat() && payType <= 2 && (
              <Radio.RadioItem
                thumb={<TenPay width="20" fill="#5AC53A" />}
                checked={payType === 2}
                onChange={this.handleRadioChange(2)}
              >
                微信支付
              </Radio.RadioItem>
            )}
          </List>
        </div>
        <WhiteSpace size="xl" />
        <div className={styles.btnArea}>
          <Button onClick={() => this.validate()} loading={submitting}>
            立即支付
          </Button>
        </div>
      </div>
    );
  }
}

export default Payment;
