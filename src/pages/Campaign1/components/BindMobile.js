import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Button, Toast, InputItem, List } from 'antd-mobile';
import { createForm } from 'rc-form';
import Mask from '@/components/Mask';
import InputPhoneText from '@/components/InputPhoneText';
import wxToken from '@/utils/wxToken';

import styles from './BindMobile.less';

@connect(({ loading }) => ({
  loading: loading.effects['global/bindMobile'],
}))
@createForm()
class BindMobile extends PureComponent {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    // 绑定
    onBind: PropTypes.func,
    onHide: PropTypes.func,
  };

  static defaultProps = {
    onBind() {},
    onHide() {},
  };

  // 关联手机号
  validate = () => {
    const {
      form: { validateFields },
      dispatch,
      onBind
    } = this.props;

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
              onBind(response);
            } else {
              onBind();
            }
          },
        });
      });
    });
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

  render() {
    const {
      form: { getFieldError, getFieldProps },
      show,
      loading,
      onHide,
    } = this.props;
    return (
      <Mask show={show} height="7.36rem" showClose onHide={onHide}>
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
            <Button onClick={this.validate} loading={loading} disabled={loading}>
              确定
            </Button>
          </div>
        </div>
      </Mask>
    );
  }
}

export default BindMobile;
