import Constants from './Constants.js';
const { HEIGHT, WIDTH } = Constants.DEFAULT;
const {
  MAX_HEIGHT,
  MAX_WIDTH,
  DEFAULT_COLOR,
  LEFT_BUTTON,
  MIDDLE_BUTTON,
  RIGHT_BUTTON,
} = Constants;

import { createGrid } from './controllers/GridController.js';
import { paintCell, clearCell } from './controllers/DrawingController.js';
import {
  debounce,
  random255,
  randomRGBA,
  rgbStrToArr,
  rgbaArrToStr,
  hexStrToRGBArr,
} from './Helpers.js';

import { Memory } from './controllers/MemoryController.js';
const appMemory = new Memory();

/* DOM */

const grid = document.querySelector('.grid-container');
const rowsInput = document.getElementById('rows-input');
const colsInput = document.getElementById('cols-input');

/* Buttons */

const clearBtn = document.getElementById('clear-draw');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const exportBtn = document.getElementById('export-btn');

/* Color management variables */

const colorPicker = document.getElementById('color-picker');
const randomColorToggle = document.getElementById('random-color');
let chosenColor = DEFAULT_COLOR;
let randomColorChecked = randomColorToggle.checked;

/* Memory */

let currentRun = 0;

/*
 Creates a Uint8ClampedArray from the current grid to use as the basis for the PNG  to export. More on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray
*/
function getBuffer(grid) {
  return new Uint8ClampedArray(
    Array.from(grid.children)
      .map((cell) => {
        let color = cell.style.backgroundColor;
        return color ? [...rgbStrToArr(color), 255] : [0, 0, 0, 0];
      })
      .flat()
  );
}

/*
 Creates a PNG based on a Uint8ClampedArray that has 'grid cells * 4' bits to accommodate 4 bits per RGBA value (per cell). Needs attribution, I misplaced the StackOverflow answer that gave me the initial idea.
*/
function getPNGFromBuffer(buffer) {
  let width = Number(rowsInput.value);
  let height = Number(colsInput.value);

  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  let idata = ctx.createImageData(width, height);

  idata.data.set(buffer);

  ctx.putImageData(idata, 0, 0);

  let dataUri = canvas.toDataURL();

  return dataUri;
}

/* Create an invisible anchor element on the document that contains the PNG data, is clicked to download, and then removed from the document. */
const download = (filename, data) => {
  let anchor = document.createElement('a');
  anchor.setAttribute('href', data);
  anchor.setAttribute('download', filename);
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

/* Adds a random suffix based on the current epoch milliseconds (we can likely do better) and calls download with the filename and the return from getPNGFromBuffer(getBuffer(grid)) or a png as a base64 URI */
function downloadPNG() {
  let randomSuffix = new Date().getTime();
  download('pixel' + randomSuffix, getPNGFromBuffer(getBuffer(grid)));
}

const exportPNG = debounce(() => downloadPNG());

/* Saves grid to localStorage by getting all children of the grid element that contain colors and stringifying that so it can be stored */
function saveGridToLocalStorage() {
  let saveData = Array.from(grid.children)
    .filter((cell) => !['', 'unset'].includes(cell.style.backgroundColor))
    .map((cell) => cell.id + '|' + cell.style.backgroundColor)
    .join('/');

  if (saveData.length) {
    saveData = rowsInput.value + 'x' + colsInput.value + '/' + saveData;
    localStorage.setItem('pixel', saveData);
  }
}

const saveGrid = debounce(() => saveGridToLocalStorage());

/* 
Loads a grid from localStorage if present, 
 */
function loadGridFromLocalStorage() {
  let strOfGrid = localStorage.getItem('pixel');
  let arrOfGrid = strOfGrid.split('/');
  let gridSize = arrOfGrid.shift().split('x');
  rowsInput.value = gridSize[0];
  colsInput.value = gridSize[1];

  createGrid(gridSize[0], gridSize[1]);

  arrOfGrid.forEach((cell) => {
    document.getElementById(cell.split('|')[0]).style.backgroundColor =
      cell.split('|')[1];
  });
}

const loadGrid = debounce(() => {
  if (localStorage.getItem('pixel')) loadGridFromLocalStorage();
});

/* Event Handlers */

document.onsubmit = (e) => e.preventDefault();

saveBtn.onclick = saveGrid;
loadBtn.onclick = loadGrid;
exportBtn.onclick = exportPNG;

/* isLeftClick and isRightClick check whether the mouse button being pressed is left or right, it's not infallible as it uses MouseEvent.button which may point to different buttons on some remapped devices, but it'll do for now */
function isLeftClick(e) {
  return e.button === LEFT_BUTTON;
}

function isRightClick(e) {
  return e.button === RIGHT_BUTTON;
}

/* Checks if the current cell being moused over is in the current run (the current painting movement before the mouseup event), this is to prevent trying to paint over a cell multiple times and filling up memory with duplicates */
function isCell(e) {
  return e.target.classList.contains('cell');
}

function getColors(e, isClearing = false) {
  let prevColor = e.target.style.backgroundColor || '';
  return isClearing
    ? { prevColor, currColor: '' }
    : { prevColor, currColor: randomColorChecked ? randomRGBA() : chosenColor };
}

function colorsAreDifferent(colors) {
  return colors.currColor !== colors.prevColor;
}

/* Paints only if the current cell hasn't been painted over during the current run. This is probably the root of the not being able to paint over painted cells issue #1 */
function handlePainting(e) {
  if (isCell(e)) {
    let colors = getColors(e);
    if (colorsAreDifferent(colors)) {
      let id = e.target.id;
      updateCellRun(e);
      paintCell(e, colors.currColor);
      appMemory.writeIntermidiateMemory({ id, ...colors });
    }
  }
}

function handleClearing(e) {
  e.preventDefault();
  if (isCell(e)) {
    let colors = getColors(e, true);
    if (colorsAreDifferent(colors)) {
      let id = e.target.id;
      updateCellRun(e);
      clearCell(e);
      appMemory.writeIntermidiateMemory({ id, ...colors });
    }
  }
}

/* Runs undo or redo functions based on whether CTRL + Z or CTRL + Y are pressed, and if there's data on undoStore/redoStore */
function handleKeyDown(e) {
  if (e.keyCode == 90 && e.ctrlKey && appMemory.undoStore.length) undo(e);
  if (e.keyCode == 89 && e.ctrlKey && appMemory.redoStore.length) redo(e);
}

/* undoes the last cell by getting the relevant data from undoStore and painting the grid with it */
function undo(e) {
  let change = appMemory.undoStore.pop();
  for (const cell of change) {
    document.getElementById(cell.id).style.backgroundColor = cell.prevColor;
  }
  appMemory.redoStore.push(change);
}

/* redoes last undo, only works if no cell has been done after the last undo */
function redo(e) {
  let change = appMemory.redoStore.pop();
  for (const cell of change) {
    document.getElementById(cell.id).style.backgroundColor = cell.currColor;
  }
  appMemory.undoStore.push(change);
}

/* Updates the currentRun variable, which represents the current painting movement being carried out to prevent the same cells from being painted multiple times. Likely involved in Issue #1 */
function updateCellRun(e) {
  e.target.dataset.run = currentRun;
}

/* We need to remove event listeners that paint and clear cells once we hear mouseup because otherwise you might end up painting indefinitely, or clearing when you meant to paint. There's probably a solution we should adopt instead of this. */
function handleMouseup(e) {
  removeListeners(e);

  if (!appMemory.intermediateMemory.length) {
    if (isLeftClick(e)) {
      handlePainting(e);
    } else if (isRightClick(e)) {
      handleClearing(e);
    }
  }
  appMemory.undoStore.push(appMemory.intermediateMemory.pop());
  if (appMemory.redoStore.length) appMemory.redoStore.length = 0;
}

function removeListeners(e) {
  grid.removeEventListener('mousemove', handlePainting);
  grid.removeEventListener('mousemove', handleClearing);
  grid.removeEventListener('mouseup', handleMouseup);
}

/* While mousedown is happening, either painting or clearing cells must happen */
function handleMousedown(e) {
  currentRun += 1;
  if (isLeftClick(e)) {
    grid.addEventListener('mousemove', handlePainting);
  } else if (isRightClick(e)) {
    grid.addEventListener('mousemove', handleClearing);
  }
  grid.addEventListener('mouseup', handleMouseup);
}

/* Event Listeners */

document.onkeydown = handleKeyDown;

colorPicker.addEventListener('input', (e) => {
  chosenColor = rgbaArrToStr(hexStrToRGBArr(e.target.value));
});

randomColorToggle.addEventListener('input', (e) => {
  randomColorChecked = randomColorToggle.checked;
});

clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (rowsInput.value > MAX_HEIGHT) rowsInput.value = MAX_HEIGHT;
  if (colsInput.value > MAX_WIDTH) colsInput.value = MAX_WIDTH;
  createGrid(grid, rowsInput.value || HEIGHT, colsInput.value || WIDTH);
});

//grid.addEventListener('click', handlePainting);

grid.addEventListener('mousedown', handleMousedown);

grid.addEventListener('contextmenu', handleClearing);

// Prevent dragging to avoid glitchy drawing

grid.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

/* Lifecycle */

createGrid(grid, HEIGHT, WIDTH);
