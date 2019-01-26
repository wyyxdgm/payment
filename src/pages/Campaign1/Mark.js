import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, InputItem, List, Toast, WhiteSpace } from 'antd-mobile';
import { createForm } from 'rc-form';
import cs from 'classnames';
import qs from 'qs';
import Loading from '@/components/PageLoading';
import Map from './Map';

import { ReactComponent as Student } from '@/assets/icon/xuesheng.svg';
import { ReactComponent as Phone } from '@/assets/icon/shouji.svg';

import styles from './style.less';
import wxToken from '@/utils/wxToken';
import wxJsTicket from '@/utils/wxJsTicket';

@connect(({ loading }) => ({
  loading: loading.effects['global/wxToken'] || loading.effects['global/wxJsTicket'],
  submitLoading: loading.effects['campaign1/mark'],
}))
@createForm()
class Mark extends PureComponent {
  state = { latitude: 0, longitude: 0 };

  componentWillMount() {
    const {
      location: { query },
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
      return;
    }
    wxToken();
    wxJsTicket();
  }

  componentDidMount() {
    wxJsTicket().then(wx => {
      wx.getLocation({
        type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success: res => {
          this.setState({
            latitude: res.latitude, // 纬度，浮点数，范围为90 ~ -90
            longitude: res.longitude,
          });
        },
      });
    });
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
      const {
        coordinate: { latitude, longitude },
        ...data
      } = values;
      const payload = {
        ...data,
        mobile: data.mobile.replace(/\s/g, ''),
        latitude,
        longitude,
      };
      wxToken().then(() => {
        dispatch({
          type: 'campaign1/mark',
          payload,
          callback: response => {
            if (response.code === 200) {
              router.replace(`mark/success?${qs.stringify({ type, activityId })}`);
            } else {
              Toast.info(response.message);
            }
          },
        });
      });
    });
  };

  normal() {
    const {
      form: { getFieldError, getFieldProps },
      submitLoading,
    } = this.props;

    const { latitude, longitude } = this.state;

    return (
      <div className={cs(styles.container, styles.mark)}>
        <List>
          <InputItem
            placeholder="请输入园所名称"
            labelNumber={2}
            maxLength="30"
            clear
            error={getFieldError('name')}
            {...getFieldProps('name', {
              rules: [{ required: true, message: '请输入园所名称' }],
            })}
          >
            <Student width="20" fill="#3C70DD" />
          </InputItem>
          <InputItem
            placeholder="请输入园长姓名"
            labelNumber={2}
            maxLength="30"
            clear
            error={getFieldError('presidentName')}
            {...getFieldProps('presidentName', {
              rules: [{ required: true, message: '请输入园长姓名' }],
            })}
          >
            <Student width="20" fill="#3C70DD" />
          </InputItem>
          <InputItem
            type="phone"
            placeholder="请输入联系方式"
            labelNumber={2}
            maxLength="13"
            clear
            error={getFieldError('mobile')}
            {...getFieldProps('mobile', {
              rules: [
                { required: true, message: '请输入联系方式' },
                { len: 13, message: '请输入正确的手机号' },
              ],
            })}
          >
            <Phone width="20" fill="#3C70DD" />
          </InputItem>
          <InputItem
            placeholder="请输入园所地址"
            labelNumber={2}
            maxLength="6"
            clear
            error={getFieldError('address')}
            {...getFieldProps('address', {
              rules: [{ required: true, message: '请输入园所地址' }],
            })}
          >
            <Student width="20" fill="#3C70DD" />
          </InputItem>
          <List.Item>
            <Map
              {...getFieldProps('coordinate', {
                initialValue: { latitude, longitude },
              })}
            />
          </List.Item>
        </List>
        <WhiteSpace />
        <div className={styles.btnArea}>
          <Button onClick={this.validate} loading={submitLoading} disabled={submitLoading}>
            <span>立即标记</span>
          </Button>
        </div>
        <WhiteSpace size="xl" />
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

export default Mark;
