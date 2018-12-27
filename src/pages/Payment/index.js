import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List, InputItem, Radio, WhiteSpace, Picker, Button, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import qs from 'qs';
import router from 'umi/router';
import { isWeChat } from '@/utils/userAgent';
import { ReactComponent as Classes } from '@/assets/icon/banji.svg';
import { ReactComponent as Student } from '@/assets/icon/xuesheng.svg';
import { ReactComponent as Pay } from '@/assets/icon/jiaofeiren.svg';
import { ReactComponent as Phone } from '@/assets/icon/shouji.svg';
import { ReactComponent as AliPay } from '@/assets/icon/zhifubao.svg';
import { ReactComponent as TenPay } from '@/assets/icon/weixinzhifu.svg';

import styles from './style.less';

const { Item } = List;

@connect(({ pay, loading }) => ({
  summary: pay.summary,
  classSource: pay.classes,
  typeId: pay.typeId,
  submitting: loading.effects['pay/submit'],
}))
@createForm()
class Payment extends PureComponent {
  openId = '';

  constructor(props) {
    super(props);

    let payType = 2;
    if (!isWeChat()) {
      payType = 1;
    }
    // 支付方法 1 支付宝，2 微信
    this.state = { payType };
  }

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;

    const { formId, code } = query;
    if (!code && isWeChat()) {
      const payload = {
        appid: 'wx978d1cc596ecc4db',
        redirect_uri: window.location.href,
        response_type: 'code',
        scope: 'snsapi_base',
        state: 'STATE',
      };
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${qs.stringify(
        payload
      )}#wechat_redirect`;
    } else if (formId) {
      dispatch({ type: 'pay/detail', payload: { id: formId } });
      dispatch({ type: 'pay/cascade', payload: { formId } });
      if (isWeChat()) {
        dispatch({
          type: 'pay/openId',
          payload: { code },
          callback: responseData => {
            this.openId = responseData;
          },
        });
      }
    }
  }

  // 得到所有支付参数
  getWeChatParam(orderNo) {
    const { dispatch, typeId } = this.props;

    dispatch({
      type: 'pay/getFormInfo',
      payload: {
        orderNo,
        typeId,
        openid: this.openId,
        kindergartenId: 0,
      },
      callback: data => this.revokeWeChat(data),
    });
  }

  validate = () => {
    const {
      form: { validateFields },
      dispatch,
    } = this.props;

    validateFields((error, values) => {
      if (error) {
        Toast.info(Object.values(error)[0].errors[0].message, 3, null, false);
        return;
      }

      const { payType } = this.state;
      dispatch({
        type: 'pay/submit',
        payload: {
          payType,
          ...values,
        },
        callback: responseData => {
          if (payType === 1) {
            document.body.innerHTML = responseData;
            document.forms[0].submit();
          } else if (payType === 2) {
            this.getWeChatParam(responseData);
          }
        },
      });
    });
  };

  // 支付方式选择
  handleRadioChange = payType => () => {
    this.setState({ payType });
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
            router.replace('/result/');
            break;
          case 'get_brand_wcpay_request:fail':
            dispatch({ type: 'global/result', payload: { status: 'fail', message: '' } });
            router.replace('/result/');
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
      classSource,
      submitting,
    } = this.props;
    const { payType } = this.state;
    const { name, formContent, feeTotal, firstAmount } = summary;

    return (
      <div className={styles.container}>
        <dl className={styles.card}>
          <dt>{name}</dt>
          {formContent.map((item, index) => (
            <dd key={index}>{item}</dd>
          ))}
          <dd className={styles.divide} />
          <dd>
            <span>学费总计</span>
            <s>￥{feeTotal.toFixed(2)}</s>
          </dd>
          <dd className={styles.footer}>
            <span>
              首付款金额<small>(总金额*10%)</small>
            </span>
            <span className={styles.rate}>￥{firstAmount.toFixed(2)}</span>
          </dd>
        </dl>
        <List renderHeader={() => '学生信息'}>
          <Picker
            extra="请选择班级"
            title="选择班级"
            data={classSource}
            cols={2}
            format={label => label.join(' / ')}
            {...getFieldProps('classId', {
              rules: [{ required: true, message: '请选择所在班级' }],
            })}
          >
            <Item
              thumb={<Classes width="22" fill="#FFA800" />}
              className={styles.cascade}
              error={getFieldError('classId')}
            />
          </Picker>
          <InputItem
            placeholder="请输入学生姓名"
            labelNumber={2}
            error={getFieldError('studentName')}
            {...getFieldProps('studentName', {
              rules: [{ required: true, message: '请输入学生姓名' }],
            })}
          >
            <Student width="20" color="#FFA800" />
          </InputItem>
          <InputItem
            placeholder="请输入缴费人姓名"
            labelNumber={2}
            error={getFieldError('payName')}
            {...getFieldProps('payName', {
              rules: [{ required: true, message: '请输入缴费人姓名' }],
            })}
          >
            <Pay width="20" color="#FFA800" />
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
            <Phone width="20" color="#FFA800" />
          </InputItem>
        </List>
        <WhiteSpace />

        <List>
          {!isWeChat() && (
            <Radio.RadioItem
              thumb={<AliPay width="20" fill="#4BA7E8" />}
              checked={payType === 1}
              onChange={this.handleRadioChange(1)}
            >
              支付宝支付
            </Radio.RadioItem>
          )}
          {isWeChat() && (
            <Radio.RadioItem
              thumb={<TenPay width="20" fill="#5AC53A" />}
              checked={payType === 2}
              onChange={this.handleRadioChange(2)}
            >
              微信支付
            </Radio.RadioItem>
          )}
        </List>
        <WhiteSpace />

        <div className={styles.btnArea}>
          <Button onClick={() => this.validate()} loading={submitting}>
            确认支付 <span className={styles.btnPrice}>￥{firstAmount.toFixed(2)}</span>
          </Button>
        </div>
      </div>
    );
  }
}

export default Payment;
