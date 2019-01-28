import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import styles from './style.less';

const { qq } = window;
const persons = [
  { lastName: '张', tel: '137****5236' },
  { lastName: '王', tel: '138****0918' },
  { lastName: '李', tel: '159****0021' },
  { lastName: '赵', tel: '185****2907' },
  { lastName: '陈', tel: '177****6652' },
];

function Info(opts) {
  qq.maps.Overlay.call(this, opts);
}
Info.prototype = new qq.maps.Overlay();

Info.prototype.construct = function() {
  this.dom = document.createElement('div');
  this.dom.className = 'mapInfo';
  this.dom.innerHTML = this.get('inithtml');
  this.getPanes().floatPane.appendChild(this.dom);
};

Info.prototype.html = function(html) {
  this.dom.innerHTML = html;
};

Info.prototype.draw = function() {
  const position = this.get('position');
  if (position) {
    const pixel = this.getProjection().fromLatLngToDivPixel(position);
    console.log(this.dom);
    this.dom.style.left = `${pixel.getX() - 145 / 2}px`;
    this.dom.style.top = `${pixel.getY() - 80}px`;
  }
};

Info.prototype.destroy = function() {
  this.dom.parentNode.removeChild(this.dom);
};

export default class Map extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    onPrtAddress: PropTypes.func,
    value: PropTypes.object,
  };

  static defaultProps = {
    onChange() {},
    onPrtAddress() {},
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

    // 地图位置反查当前地址信息
    const { onPrtAddress } = this.props;
    this.geocoder = new qq.maps.Geocoder({
      complete: result => {
        // map.setCenter(result.detail.location);
        // var marker = new qq.maps.Marker({
        //   map:map,
        //   position: result.detail.location
        // });
        const { district, street, streetNumber } = result.detail.addressComponents;
        onPrtAddress(district + streetNumber + (streetNumber ? '' : street));
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (!isEqual(nextProps.value, value)) {
      const { latitude, longitude } = nextProps.value;
      const center = new qq.maps.LatLng(latitude, longitude);
      this.map.panTo(center);
      this.map.zoomTo(12);

      this.geocoder.getAddress(center);

      const circle = new qq.maps.Circle({
        map: this.map,
        center,
        fillColor: new qq.maps.Color(51, 102, 204, 0.2),
        strokeWeight: 0,
        radius: 1500,
      });
      setTimeout(() => {
        const marker = new qq.maps.Marker({
          position: center,
          animation: qq.maps.MarkerAnimation.DROP,
          map: this.map,
        });
      }, 1000);

      const person = persons[Math.floor(Math.random() * 5)];

      this.infoOverlay = new Info({
        map: this.map,
        position: center,
        inithtml: `<p>${person.lastName}** 刚刚浏览了您的园所</p><p>${person.tel}</p>`,
      });
    }
  }

  render() {
    return <div ref={this.el} className={styles.map} />;
  }
}
