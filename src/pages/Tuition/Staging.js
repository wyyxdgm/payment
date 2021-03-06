import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';

import styles from './style.less';

const stagingMap = {
  1: ['专享12个月免息', '常规1年付', '一年连读'],
  2: ['专享24个月免息', '常规2年付', '两年连读'], // 总金额
  3: ['专享6个月免息', '常规学期付', '学期连读'],
  4: ['专享3个月免息', '常规季付', '季度连读'],
  5: ['常规月付', '常规月付', '按月缴费'],
};

const stag = {
  1: 12,
  2: 24,
  3: 6,
  4: 3,
};

function sub(amount, installmentType, bonusAmount) {
  return ((amount - bonusAmount) / stag[installmentType]).toFixed(2);
}

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
    bonusAmount: PropTypes.number,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    bonusAmount: 0,
    onChange() {},
  };

  state = {
    id: 1,
  };

  el = React.createRef();

  swipper = null;

  componentDidMount() {
    const { data, onChange } = this.props;
    const { id } = data[0];
    this.setState({ id }, () => {
      onChange(data[0]);
    });
  }

  handleClick = item => () => {
    const { id } = this.state;
    if (id !== item.id) {
      const { onChange } = this.props;
      this.setState({ id: item.id });
      onChange(item);
    }
  };

  render() {
    const { data, bonusAmount } = this.props;
    const { id } = this.state;

    return (
      <div className="swiper-container" ref={this.el}>
        <div className={styles.swiperWrapper}>
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
                      <small>每月仅</small>￥
                      {item.id === id && item.installmentType !== 5
                        ? sub(item.amount, item.installmentType, bonusAmount)
                        : item.monthAmount.toFixed(2)}
                    </p>
                  </Fragment>
                )}
                {item.type === 1 && (
                  <Fragment>
                    <del />
                    <p>
                      <small>总金额</small>￥{item.amount.toFixed(2)}
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
