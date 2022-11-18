import { rgbToHex, rgbaArrToStr } from '../Helpers.js';

/* Creates a grid given rows and cols integers for width and height */
export function createGrid(grid, cellArray, rows, cols) {
  grid.textContent = '';
  grid.style.setProperty('--grid-rows', rows);
  grid.style.setProperty('--grid-cols', cols);
  cellArray.map((cell, idx) => {
    let gridCell = document.createElement('div');
    gridCell.classList.add('cell');
    gridCell.id = 'c-' + idx;
    gridCell.dataset.run = 'initial';
    gridCell.style.backgroundColor = rgbaArrToStr(cell);
    grid.appendChild(gridCell);
  });
}

function gridFromBuffer() {
  let gridBuffer = new Uint8ClampedArray(32 * 32 * 4).fill(0);
  let cellIdx = 0;
  gridBuffer.reduce((prev, curr, idx) => {
    if (idx % 4 === 0) {
      cellIdx = idx / 4;
    }

    return prev;
  }, []);
}

function bufferToArr(buffer) {
  return Array.from(buffer);
}

function stringToArr(string) {
  return string.split(',');
}

function arrToBuffer(arr) {
  return Uint8ClampedArray.from(arr);
}

export function unflattenArray(arr, n) {
  let copy = arr.concat();
  const result = [];
  while (copy.length) {
    result.push(copy.splice(0, n));
  }

  return result;
}

export const getCellArray = (arrOfGrid) =>
  unflattenArray(stringToArr(arrOfGrid), 4);
