import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import cs from 'classnames';

import styles from './style.less';

const stagingMap = {
  4326590247075845: ['专享24个月免息', '两年连读'], // 总金额
  4326590368710661: ['专享12个月免息', '一年连读'],
  4326590419042309: ['常规学期付', '学期连读'],
  4326590452596741: ['常规月付', '按月缴费'],
};

export default class Staging extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        installmentId: PropTypes.number.isRequired,
        monthAmount: PropTypes.number.isRequired,
        amount: PropTypes.number.isRequired,
        type: PropTypes.oneOf([1, 2]),
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
    const { data } = this.props;
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
              <dt>{stagingMap[item.installmentId][0]}</dt>
              <dd>
                <p>{stagingMap[item.installmentId][1]}</p>
                {item.type === 1 && (
                  <Fragment>
                    <del />
                    <p>
                      <small>每月仅</small>￥{item.monthAmount.toFixed(2)}
                    </p>
                  </Fragment>
                )}
                {item.type === 2 && (
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
