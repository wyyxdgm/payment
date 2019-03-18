import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, InputItem, List, Toast, WhiteSpace } from 'antd-mobile';
import { createForm } from 'rc-form';
import cs from 'classnames';
import qs from 'qs';
import Loading from '@/components/PageLoading';
import wxToken from '@/utils/wxToken';
import wxJsTicket from '@/utils/wxJsTicket';
import Map from './Map';

import { ReactComponent as Student } from '@/assets/icon/xuesheng.svg';
import { ReactComponent as Phone } from '@/assets/icon/shouji.svg';
import { ReactComponent as Kg } from '@/assets/icon/yuansuo.svg';
import { ReactComponent as Address } from '@/assets/icon/dizhi.svg';
import { ReactComponent as Pos } from '@/assets/icon/pos.svg';
import sharedLinkIconKg from '@/assets/campaign1/sharedLinkIconKg.png';

import styles from './style.less';

@connect(({ loading }) => ({
  loading: loading.effects['global/wxToken'] || loading.effects['global/wxJsTicket'],
  submitLoading: loading.effects['campaign1/mark'],
}))
@createForm()
class Mark extends PureComponent {
  state = { latitude: 0, longitude: 0, mapAddress: '', phAmount: 0 };

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
    wxToken(2);

    const host = window.location.origin;
    const { activityId } = query;
    wxJsTicket().then(wx => {
      const share = {
        title: '你有一个制定专属红包的特权,速领～',
        desc: '制定专属红包，让家长领个痛快！',
        link: `${host}/mform/campaign1/mark?activityId=${activityId}`,
        imgUrl: host + sharedLinkIconKg,
      };
      wx.onMenuShareAppMessage(share);
      wx.onMenuShareTimeline(share);
    });
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
    this.setState({ phAmount: Math.floor(Math.random() * 10000) + 1000 });
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
      wxToken(2).then(() => {
        dispatch({
          type: 'campaign1/mark',
          payload,
          callback: response => {
            if (response.code === 200) {
              router.replace(`markSuccess?${qs.stringify({ type, activityId })}`);
            } else {
              Toast.info(response.message);
            }
          },
        });
      });
    });
  };

  handleMapPrtAddress = mapAddress => {
    this.setState({ mapAddress });
  };

  normal() {
    const {
      form: { getFieldError, getFieldProps },
      submitLoading,
    } = this.props;

    const { latitude, longitude, mapAddress, phAmount } = this.state;

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
            <Kg width="20" fill="#3C70DD" />
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
            maxLength="30"
            clear
            error={getFieldError('address')}
            {...getFieldProps('address', {
              rules: [{ required: true, message: '请输入园所地址' }],
            })}
          >
            <Address width="20" fill="#3C70DD" />
          </InputItem>
          <List.Item>
            <Map
              onPrtAddress={this.handleMapPrtAddress}
              {...getFieldProps('coordinate', {
                initialValue: { latitude, longitude },
              })}
            />
            <div className={styles.mapTip}>
              <p>
                <Pos width="12" style={{margin: '0 5px -3px 0'}} />
                {mapAddress}
              </p>
              <p>
                附近共有<span>{phAmount}</span>个家长找幼儿园
              </p>
            </div>
          </List.Item>
        </List>
        <WhiteSpace />
        <div className={styles.btnArea}>
          <Button onClick={this.validate} loading={submitLoading} disabled={submitLoading}>
            <span>立即定制</span>
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
