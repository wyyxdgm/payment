import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { addEventListener } from 'consolidated-events';
import AwesomeQR from './AwesomeQR';

export default class extends PureComponent {
  static propTypes = {
    text: PropTypes.string.isRequired,
    size: PropTypes.number,
    margin: PropTypes.number,
    backgroundImage: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(undefined)]),
  };

  static defaultProps = {
    size: 800,
    margin: 20,
    backgroundImage: undefined,
  };

  componentDidMount() {
    const { text, size, margin, backgroundImage } = this.props;
    if (backgroundImage) {
      const img = new Image();
      this.removeBackgroundImageLoadListener = addEventListener(img, 'load', () => {
        AwesomeQR().create({
          text,
          size,
          margin,
          backgroundImage: img,
          bindElement: 'mdm-qr',
        });
      });
      img.src = backgroundImage;
    } else {
      AwesomeQR().create({
        text,
        size,
        margin,
        dotScale: 1,
        bindElement: 'mdm-qr',
      });
    }
  }

  componentWillUnmount() {
    if (this.removeBackgroundImageLoadListener) {
      this.removeBackgroundImageLoadListener();
    }
  }

  render() {
    return <img alt="二维码" id="mdm-qr" />;
  }
}
