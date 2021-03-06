import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import router from 'umi/router';
import {getPageQuery} from '@/utils/utils';

import 'swiper/dist/css/swiper.css';
import styles from './GotBonus.less';

export default class BonusSwip extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        userCouponId: PropTypes.number.isRequired,
        couponAmount: PropTypes.number.isRequired, // 券金额
        reachAmount: PropTypes.number.isRequired, // 满减额
        useScope: PropTypes.number.isRequired, // 期数
      })
    ),
  };

  static defaultProps = {
    data: [],
  };

  el = React.createRef();

  swipper = null;

  handleDLClick = () => {
    const {activityId, code} = getPageQuery();
    router.push(`bonus?activityId=${activityId}&code=${code}`);
  };

  render() {
    const { data } = this.props;
    return (
      <div className={cs(styles.bonus, 'swiper-container')} ref={this.el}>
        <div className="swiper-wrapper">
          {data.map(item => (
            <dl className="swiper-slide" key={item.userCouponId} onClick={this.handleDLClick}>
              <dt>{item.useScope}期可用</dt>
              <dd>
                {item.couponAmount}
                <small>元</small>
              </dd>
              <dd>月付{Math.floor((item.reachAmount - item.couponAmount) / item.useScope)}元起可用</dd>
            </dl>
          ))}
        </div>
      </div>
    );
  }
}
