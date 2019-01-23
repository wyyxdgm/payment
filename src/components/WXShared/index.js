import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import shareTip from './shareTip.png';
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
    const { show } = this.props;
    return (
      <div>
        {show && (
          <div className={styles.share} onClick={this.handleClick}>
            <img src={shareTip} alt="右上角分享" />
          </div>
        )}
      </div>
    );
  }
}
