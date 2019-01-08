import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InputItem, Picker } from 'antd-mobile';
import find from 'lodash/find';

import styles from './InputSelect.less';

function getLabel(data, value) {
  const item = find(data, { value: value[0] });
  if (item) {
    return item.label;
  }
  return '';
}

export default class extends PureComponent {
  static propTypes = {
    dataSource: PropTypes.array,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
    icon: PropTypes.element,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    dataSource: [],
    error: false,
    icon: '',
    placeholder: '请输入',
    value: PropTypes.string,
    onChange() {},
  };

  handlePickerChange = val => {
    const { dataSource, onChange } = this.props;
    onChange(getLabel(dataSource, val));
  };

  render() {
    const { dataSource, error, icon, onChange, value, placeholder, children } = this.props;
    return (
      <div className={styles.container}>
        <div>
          <InputItem
            placeholder={placeholder}
            labelNumber={2}
            maxLength="20"
            error={error}
            value={value}
            onChange={onChange}
          >
            {icon}
          </InputItem>
        </div>
        <Picker title="选择学生" data={dataSource} cols={1} onChange={this.handlePickerChange}>
          <a>{children}</a>
        </Picker>
      </div>
    );
  }
}
