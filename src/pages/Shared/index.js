import React, { PureComponent } from 'react';
import MergeQR from './MergedQR';
import bg from './bg.png';
import qr from './qr.png';

export default class Shared extends PureComponent {
  state = { dataURL: '' };

  componentDidMount() {
    MergeQR(bg, qr).then(dataURL => {
      this.setState({ dataURL });
    });
  }

  render() {
    const { dataURL } = this.state;
    return (
      <div>
        <img src={dataURL} alt="分期" style={{ maxWidth: '100%' }} />
      </div>
    );
  }
}
