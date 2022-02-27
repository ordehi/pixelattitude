/* Utility Functions */

/* 
To prevent multiple consecutive writes/reads from storage
Idea from https://www.freecodecamp.org/news/javascript-debounce-example/
 */
export function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout);
  };
}

/* Get a random number from 0 to 255 to use as RGB values */
export function random255() {
  return Math.floor(Math.random() * 255);
}

/* Get a random RGBA value */
export function randomRGBA() {
  let r = random255();
  let g = random255();
  let b = random255();
  let a = Math.random().toFixed(1);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// function hexStrToRGBArr(hashHex) {
//   let hex = hashHex[0] === '#' ? hashHex.substring(1) : hashHex;
//   return hex.match(/.{1,2}/g).map((hexVal) => parseInt(hexVal, 16));
// }

/* Extract RGB values from a string */
export function rgbStrToArr(str = '') {
  let match = str.match(/(rgba?)|(\d+(\.\d+)?%?)|(\.\d+)/g);
  if (match) {
    if (!match[0].includes('rgba')) {
      return [Number(match[1]), Number(match[2]), Number(match[3]), 255];
    }
    return [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      Number(match[4]),
    ];
  } else {
    return [0, 0, 0, 0];
  }
}

export function rgbaArrToStr(arr = [0, 0, 0, 0]) {
  return arr.length === 4
    ? 'rgba(' + arr.join(', ') + ')'
    : 'rgb(' + arr.join(', ') + ')';
}

export function hexStrToRGBArr(strHex = '') {
  let match = strHex.match(/[^#]{1,2}/g);
  return match
    ? [...match.map((hexVal) => parseInt(hexVal, 16)), 255]
    : [0, 0, 0, 0];
}

export function hexToRGB(hexStr) {
  let rgbArr = hexStrToRGBArr(hexStr);
  rgbArr.pop();
  let rgb = rgbaArrToStr(rgbArr);
  return rgb;
}

function decimalToHex(decimal) {
  return decimal.toString(16);
}

export function rgbToHex(rgbStr, popAlpha) {
  let rgbArr = rgbStrToArr(rgbStr);
  if (popAlpha) rgbArr.pop();
  let hexVals = rgbArr.map((val) => decimalToHex(val)).join('');
  return '#' + hexVals;
}

export function rgbToRGBA(rgb) {
  if (rgb.includes('rgba')) return rgb;
  let rgbArr = rgbStrToArr(rgb);
  return rgbaArrToStr(rgbArr);
}

export function getCellId(e) {
  return e.target.id;
}

/* Updates the currentRun variable, which represents the current painting movement being carried out to prevent the same cells from being painted multiple times. Likely involved in Issue #1 */
export function updateCellRun(e) {
  e.target.dataset.run = currentRun;
}

export function isNotInRun(e) {
  return Number(e.target.dataset.run) !== currentRun;
}
