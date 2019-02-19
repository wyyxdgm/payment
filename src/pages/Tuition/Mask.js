import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from './style.less';

export default class extends PureComponent {
  static propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
  };

  static defaultProps = {
    show: false,
    onHide() {},
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.show) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }

  handleClick = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    const { show, children } = this.props;
    return (
      <div>
        {show && (
          <div
            className={styles.mask}
            onClick={this.handleClick}
            style={{ height: `${document.documentElement.scrollHeight}px` }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
}
