const canvas = document.createElement('canvas');
canvas.setAttribute('width', '750');
canvas.setAttribute('height', '416');
const cxt = canvas.getContext('2d');
const bgImg = new Image();
const qrImg = new Image();

function roundRect(x, y, w, h, radius) {
  let r = radius;
  const minSize = Math.min(w, h);
  if (radius > minSize / 2) {
    r = minSize / 2;
  }
  // 开始绘制
  cxt.beginPath();
  cxt.moveTo(x + r, y);
  cxt.arcTo(x + w, y, x + w, y + h, r);
  cxt.arcTo(x + w, y + h, x, y + h, r);
  cxt.arcTo(x, y + h, x, y, r);
  cxt.arcTo(x, y, x + w, y, r);
  cxt.closePath();
}

function fillBg(img) {
  return new Promise(resolve => {
    bgImg.onload = () => {
      cxt.fillStyle = 'rgba(255, 255, 255, 0)';
      cxt.drawImage(bgImg, 0, 0);
      resolve();
    };
    bgImg.src = img;
  });
}

function draw(img, x, y, round) {
  roundRect(x, y, img.width, img.height, round || 0);
  cxt.fillStyle = cxt.createPattern(img, 'no-repeat');

  // 图片纹理是从左上角即(0, 0)位置开始填充，所以需要先位移到矩形框的位置，再填充
  cxt.translate(x, y);
  cxt.fill();
  cxt.translate(-x, -y);
}

function fillQR(img) {
  return new Promise(resolve => {
    qrImg.onload = () => {
      draw(qrImg, 278, 142, 10);
      resolve(canvas.toDataURL('image/png'));
    };
    qrImg.src = img;
  });
}

export default function mergedQR(bg: string, qr: string) {
  return new Promise(async resolve => {
    await fillBg(bg);
    const dataURL = await fillQR(qr);
    resolve(dataURL);
  });
}
