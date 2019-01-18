import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { List, InputItem, WhiteSpace, Button, Toast } from 'antd-mobile';
import { createForm } from 'rc-form';
import qs from 'qs';
import router from 'umi/router';
import Loading from '@/components/PageLoading';
import InputSelect from '@/components/InputSelect';
import { isWeChat } from '@/utils/userAgent';
import { ReactComponent as Student } from '@/assets/icon/xuesheng.svg';
import { ReactComponent as Pay } from '@/assets/icon/jiaofeiren.svg';
import { ReactComponent as Phone } from '@/assets/icon/shouji.svg';

import styles from './style.less';

@connect(({ pay, loading }) => ({
  summary: pay.summary,
  typeId: pay.typeId,
  students: pay.students,
  submitting: loading.effects['pay/submit'],
  detailLoading: loading.effects['pay/detail'],
}))
@createForm()
class Payment extends PureComponent {
  constructor(props) {
    super(props);

    const payType = isWeChat() ? 2 : 1;
    // 支付方法 1 支付宝，2 微信, 5 寺库
    this.state = { payType };
    this.typeId = 0;
  }

  componentWillMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;

    const { formId, classId, code, state } = query;
    if ((isWeChat() && !(code && state)) || !isWeChat()) {
      // 微信未认证，或者其他客户端访问，就走这里
      if (formId) {
        dispatch({ type: 'pay/detail', payload: { id: formId } });
      }
      if (classId) {
        dispatch({ type: 'pay/student', payload: { classId } });
      }
    } else if (isWeChat()) {
      const [orderNo, typeId, kindergartenId] = state.split('|');
      dispatch({
        type: 'pay/openId',
        payload: { code, kindergartenId },
        callback: openid => {
          dispatch({
            type: 'pay/getFormInfo',
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

  validate = () => {
    const {
      location: { query },
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
      const { student, ...newValues } = values;
      dispatch({
        type: 'pay/submit',
        payload: {
          payType,
          ...newValues,
          studentName: values.student.label,
          studentId: values.student.value,
          typeId,
          classId: query.classId,
          className: query.className,
          payPhone: values.payPhone.replace(/\s/g, ''),
        },
        callback: responseData => {
          if (payType === 1) {
            document.body.innerHTML = responseData;
            document.forms[0].submit();
          } else if (payType === 2) {
            this.oauth(responseData, typeId);
          }
        },
      });
    });
  };

  // 微信授权，会使页面重定向
  oauth(orderNo, typeId) {
    const {
      location: { query },
    } = this.props;

    const { kindergartenId } = query;
    const payload = {
      appid: 'wx978d1cc596ecc4db',
      redirect_uri: window.location.href,
      response_type: 'code',
      scope: 'snsapi_base',
      state: `${orderNo}|${typeId}|${kindergartenId}`,
    };
    window.location.replace(
      `https://open.weixin.qq.com/connect/oauth2/authorize?${qs.stringify(payload)}#wechat_redirect`
    );
    // 重新跳转回来后处理的逻辑在componentWillMount里
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
    const {
      form: { getFieldProps, getFieldError },
      summary,
      students,
      submitting,
    } = this.props;
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
          <InputSelect
            dataSource={students}
            placeholder="请输入学生姓名"
            icon={<Student width="20" fill="#FFA800" />}
            error={getFieldError('student')}
            {...getFieldProps('student', {
              rules: [{ required: true, message: '请输入学生姓名' }],
            })}
          >
            选择学生
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
            <Pay width="20" fill="#FFA800" />
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
            <Phone width="20" fill="#FFA800" />
          </InputItem>
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

  render() {
    const { detailLoading } = this.props;
    return detailLoading === undefined || detailLoading ? <Loading /> : this.normal();
  }
}

export default Payment;
