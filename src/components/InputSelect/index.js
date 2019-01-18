import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InputItem, Picker } from 'antd-mobile';
import find from 'lodash/find';

import styles from './index.less';

function getLabel(data, value) {
  const item = find(data, { value: value[0] });
  if (item) {
    return item.label;
  }
  return '';
}

function getValue(data, label) {
  const item = find(data, { label });
  if (item) {
    return item.value;
  }
  return 0;
}

export default class extends PureComponent {
  static propTypes = {
    dataSource: PropTypes.array,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
    icon: PropTypes.element,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  };

  static defaultProps = {
    dataSource: [],
    error: false,
    icon: '',
    placeholder: '请输入',
    value: { label: '', value: 0 },
    onChange() {},
  };

  handlePickerChange = val => {
    const { dataSource, onChange } = this.props;
    onChange({ label: getLabel(dataSource, val), value: val[0] });
  };

  handleInputChange = val => {
    const { dataSource, onChange } = this.props;
    onChange({ label: val, value: getValue(dataSource, val) });
  };

  render() {
    const { dataSource, error, icon, value, placeholder, children } = this.props;
    return (
      <div className={styles.container}>
        <div>
          <InputItem
            placeholder={placeholder}
            labelNumber={2}
            maxLength="20"
            error={error}
            value={value.label}
            onChange={this.handleInputChange}
          >
            {icon}
          </InputItem>
        </div>
        <Picker title={children} data={dataSource} cols={1} onChange={this.handlePickerChange}>
          <a>{children}</a>
        </Picker>
      </div>
    );
  }
}
