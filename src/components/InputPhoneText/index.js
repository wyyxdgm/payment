import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InputItem, Button } from 'antd-mobile';
import cs from 'classnames';

import styles from './index.less';

export default class extends PureComponent {
  static propTypes = {
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
    icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onTextButtonClick: PropTypes.func,
    value: PropTypes.string,
  };

  static defaultProps = {
    error: false,
    icon: '',
    placeholder: '请输入',
    value: '',
    onChange() {},
    onTextButtonClick() {},
  };

  constructor(props) {
    super(props);

    this.intevalID = -1;
    this.state = {
      countdown: 0,
      status: '',
    };
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  handleTextButtonClick = () => {
    const { value, onTextButtonClick } = this.props;
    onTextButtonClick(value.replace(/\s/g, ''));
    this.runCountdown();
  };

  handleInputChange = val => {
    const { onChange } = this.props;
    onChange(val);
  };

  async runCountdown() {
    await this.setState({ status: 'counting', countdown: 60 });
    clearInterval(this.intervalID);
    this.intervalID = setInterval(() => {
      const { countdown } = this.state;
      if (countdown <= 0) {
        clearInterval(this.intervalID);
        this.setState({ status: '' });
      } else {
        this.setState({ countdown: countdown - 1 });
      }
    }, 1000);
  }

  render() {
    const { error, icon, value, placeholder } = this.props;
    const { status, countdown } = this.state;
    return (
      <div className={cs(styles.container, styles.red)}>
        <div>
          <InputItem
            type="phone"
            placeholder={placeholder}
            labelNumber={2}
            error={error}
            value={value}
            onChange={this.handleInputChange}
          >
            {icon}
          </InputItem>
        </div>
        <Button
          disabled={value.length === 0 || status === 'counting' || !!error}
          onClick={this.handleTextButtonClick}
          inline
          size="small"
          className={styles.button}
        >
          {status === 'counting' ? `重新发送(${countdown}s)` : '获取验证码'}
        </Button>
      </div>
    );
  }
}
