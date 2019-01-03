import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import Swiper from 'swiper';
import isEqual from 'lodash/isEqual';
import cs from 'classnames';

import styles from './style.less';

const stagingMap = {
  1: ['12期免息', '一次性缴纳12个月', '一年连续'],
  2: ['24期免息', '一次性缴纳24个月', '两年连续'], // 总金额
  3: ['6期免息', '一次性缴纳1学期', '学期连续'],
  4: ['3期免息', '一次性缴纳1季度', '季度连续'],
  5: ['按月缴费', '按月缴费', '按月缴费'],
};

export default class Staging extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        monthAmount: PropTypes.number.isRequired,
        amount: PropTypes.number.isRequired,
        type: PropTypes.number.isRequired,
        installmentType: PropTypes.number.isRequired,
      })
    ),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    onChange() {},
  };

  state = {
    id: 1,
  };

  el = React.createRef();

  swipper = null;

  componentWillReceiveProps(nextProps) {
    const { data: currData, onChange } = this.props;
    if (!isEqual(nextProps.data, currData) && nextProps.data.length > 0) {
      const { id } = nextProps.data[0];
      this.setState({ id }, () => {
        this.swiper = new Swiper(this.el.current, {
          slidesPerView: 2.3,
          spaceBetween: 10,
          freeMode: true,
        });
        onChange(nextProps.data[0]);
      });
    }
  }

  componentWillUnmount() {
    this.swiper.destroy();
  }

  handleClick = item => () => {
    const { onChange } = this.props;
    this.setState({ id: item.id });
    onChange(item);
  };

  render() {
    const { data } = this.props;
    const { id } = this.state;
    return (
      <div className="swiper-container" ref={this.el}>
        <div className="swiper-wrapper">
          {data.map(item => (
            <dl
              key={item.id}
              className={cs({ [styles.checked]: id === item.id }, 'swiper-slide')}
              onClick={this.handleClick(item)}
            >
              <dt>{stagingMap[item.installmentType][item.type === 2 ? 0 : 1]}</dt>
              <dd>
                <p>{stagingMap[item.installmentType][2]}</p>
                {item.type === 2 && (
                  <Fragment>
                    <del>￥{item.amount}元</del>
                    <p>
                      <small>每月仅</small>￥{item.monthAmount}
                    </p>
                  </Fragment>
                )}
                {item.type === 1 && (
                  <Fragment>
                    <del />
                    <p>
                      <small>总金额</small>￥{item.amount}
                    </p>
                  </Fragment>
                )}
              </dd>
            </dl>
          ))}
        </div>
      </div>
    );
  }
}
