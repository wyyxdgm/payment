import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import styles from './style.less';

const { qq } = window;
export default class Map extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.object,
  };

  static defaultProps = {
    onChange() {},
    value: { latitude: 39.91485, longitude: 116.403765 },
  };

  constructor(props) {
    super(props);

    this.el = React.createRef();
    this.map = null;
  }

  componentDidMount() {
    this.map = new qq.maps.Map(this.el.current, {
      center: new qq.maps.LatLng(39.91485, 116.403765),
      zoom: 13,
      zoomControl: false,
      mapTypeControl: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (!isEqual(nextProps.value, value)) {
      const { latitude, longitude } = nextProps.value;
      const center = new qq.maps.LatLng(latitude, longitude);
      this.map.panTo(center);
      this.map.zoomTo(13);

      const circle = new qq.maps.Circle({
        map: this.map,
        center,
        fillColor: new qq.maps.Color(51, 102, 204, 0.2),
        strokeWeight: 0,
        radius: 1000,
      });
      setTimeout(() => {
        const marker = new qq.maps.Marker({
          position: center,
          animation: qq.maps.MarkerAnimation.DROP,
          map: this.map,
        });
      }, 1000);
    }
  }

  render() {
    return <div ref={this.el} className={styles.map} />;
  }
}
