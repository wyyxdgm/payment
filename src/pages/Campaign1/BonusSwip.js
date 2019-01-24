import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';
import 'swiper/dist/css/swiper.css';

import styles from './bonus.less';

export default class BonusSwip extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        monthAmount: PropTypes.number.isRequired,
        amount: PropTypes.number.isRequired,
      })
    ),
  };

  static defaultProps = {
    data: [],
  };

  el = React.createRef();

  swipper = null;

  render() {
    return (
      <div className={cs(styles.bonus, 'swiper-container')} ref={this.el}>
        <div className="swiper-wrapper">
          <dl className="swiper-slide">
            <dt>24期可用</dt>
            <dd>2000元</dd>
            <dd>月付4083元起可用</dd>
          </dl>
          <dl className="swiper-slide">
            <dt>24期可用</dt>
            <dd>2000元</dd>
            <dd>月付4083元起可用</dd>
          </dl>
          <dl className="swiper-slide">
            <dt>24期可用</dt>
            <dd>2000元</dd>
            <dd>月付4083元起可用</dd>
          </dl>
        </div>
      </div>
    );
  }
}
