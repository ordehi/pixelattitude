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
export function rgbStrToArr(strRGB = '') {
  let match = strRGB.match(
    /rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/
  );
  return match ? [match[1], match[2], match[3]] : [0, 0, 0];
}

export function rgbaArrToStr(arr = [0, 0, 0, 0]) {
  return arr.length === 4
    ? 'rgba(' + arr.join(', ') + ')'
    : 'rgb(' + arr.join(', ') + ')';
}

export function hexStrToRGBArr(strHex = '') {
  let match = strHex.match(/[^#]{1,2}/g);
  return match ? match.map((hexVal) => parseInt(hexVal, 16)) : [0, 0, 0, 0];
}
