import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd-mobile';
import styles from './style.less';

export default class extends PureComponent {
  static propTypes = {
    show: PropTypes.bool,
    // css值，距离顶部距离，默认居中偏上
    marginTop: PropTypes.string,
    // 窗体高度，这决定了自动居中方式，默认2.76rem
    height: PropTypes.string,
    showClose: PropTypes.bool,
    onHide: PropTypes.func,
  };

  static defaultProps = {
    show: false,
    marginTop: '',
    height: '2.76rem',
    showClose: false,
    onHide() {},
  };

  hideTriggerFromChildren = false;

  handleClick = () => {
    const { onHide } = this.props;
    onHide(this.hideTriggerFromChildren);
    this.hideTriggerFromChildren = false;
  };

  // 有些弹出层是表单，需要标识出单击事件是不是来自弹出层窗体
  handlePreventClick = () => {
    this.hideTriggerFromChildren = true;
  };

  handleCloseClick = e => {
    e.stopPropagation();
    const { onHide } = this.props;
    onHide(false);
    this.hideTriggerFromChildren = false;
  };

  render() {
    const { show, marginTop, height, showClose, children } = this.props;
    return (
      <div>
        {show && (
          <div className={styles.share} onClick={this.handleClick}>
            <div
              className={styles.win}
              style={{ marginTop: marginTop || `calc((100vmax - ${height}) / 3.5)` }}
              onClick={this.handlePreventClick}
            >
              {children}
              {showClose && (
                <div className={styles.close}>
                  <Icon
                    type="cross-circle"
                    color="#fff"
                    onClick={this.handleCloseClick}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
