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

  handleClick = () => {
    const {onHide} = this.props;
    onHide();
  };

  render() {
    const { show, children } = this.props;
    return (
      <div>
        {show && (
          <div className={styles.share} onClick={this.handleClick}>
            {children}
          </div>
        )}
      </div>
    );
  }
}
