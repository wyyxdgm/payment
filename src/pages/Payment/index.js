import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List, InputItem, Radio, WhiteSpace, Picker, Button, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import qs from 'qs';
import { isAliPay, isWeChat } from '@/utils/userAgent';
import { ReactComponent as Classes } from '@/assets/icon/banji.svg';
import { ReactComponent as Student } from '@/assets/icon/xuesheng.svg';
import { ReactComponent as Pay } from '@/assets/icon/jiaofeiren.svg';
import { ReactComponent as Phone } from '@/assets/icon/shouji.svg';
import { ReactComponent as AliPay } from '@/assets/icon/zhifubao.svg';
import { ReactComponent as TenPay } from '@/assets/icon/weixinzhifu.svg';

import styles from './style.less';

const { Item } = List;

function aliPay(html) {
  document.body.innerHTML = html;
  document.forms[0].submit();
}

function redirectForCode(id, typeId) {
  const payload = {
    appid: 'wx978d1cc596ecc4db',
    redirect_uri: 'http://m.hoogoo.cn/login',
    response_type: 'code',
    scope: 'snsapi_base',
    state: `${id},${typeId}`,
  };
  window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${qs.stringify(
    payload
  )}#wechat_redirect`;
}

function revokeWeChat(data) {
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
      if (res.err_msg === 'get_brand_wcpay_request:ok') {
        alert('支付成功')
      }
    }
  );
}

@connect(({ pay, loading }) => ({
  summary: pay.summary,
  classSource: pay.classes,
  typeId: pay.typeId,
  submitting: loading.effects['pay/submit'],
}))
@createForm()
class Payment extends PureComponent {
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

    const { formId } = query;
    if (formId) {
      dispatch({ type: 'pay/detail', payload: { id: formId } });
      dispatch({ type: 'pay/cascade', payload: { formId } });
    }
  }

  componentDidMount() {
    const {
      dispatch,
      location: { query },
    } = this.props;

    // 微信支付重定向到当前页
    if (query.code) {
      dispatch({
        type: 'pay/openId',
        payload: { code: query.code },
        callback: responseData => {
          this.getWeChatParam(responseData);
        },
      });
    }
  }

  // 得到所有支付参数
  getWeChatParam(openId) {
    const {
      dispatch,
      location: { query },
    } = this.props;

    const { state } = query;
    const splitState = state.split(',');
    dispatch({
      type: 'pay/getFormInfo',
      payload: {
        orderNo: splitState[0],
        typeId: splitState[1],
        openId,
      },
      callback: revokeWeChat,
    });
  }

  validate = () => {
    const {
      form: { validateFields },
      dispatch,
      typeId,
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
            aliPay(responseData);
          } else if (payType === 2) {
            redirectForCode(responseData, typeId);
          }
        },
      });
    });
  };

  // 支付方式选择
  handleRadioChange = payType => () => {
    this.setState({ payType });
  };

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
            extra="请选择"
            title="选择班级"
            data={classSource}
            cols={2}
            {...getFieldProps('classId', {
              rules: [{ required: true, message: '请选择所在班级' }],
            })}
          >
            <Item
              thumb={<Classes width="22" fill="#FFA800" />}
              arrow="horizontal"
              className={styles.cascade}
              error={getFieldError('classId')}
            >
              学生所在班级
            </Item>
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
          {!isWeChat() && (
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
            确认支付 ￥{firstAmount.toFixed(2)}
          </Button>
        </div>
      </div>
    );
  }
}

export default Payment;
