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

import { createGrid, getCellArray } from './controllers/GridController.js';
import {
  handlePainting,
  handleClearing,
} from './controllers/DrawingController.js';
import { debounce, rgbStrToArr, hexToRGB, rgbToRGBA } from './Helpers.js';
import { Memory } from './controllers/MemoryController.js';

/* DOM */

const grid = document.querySelector('.grid-container');
const rowsInput = document.getElementById('rows-input');
const colsInput = document.getElementById('cols-input');

/* Buttons */

const clearBtn = document.getElementById('clear-draw');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const exportBtn = document.getElementById('export-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');

/* Color management variables */

const colorPicker = document.getElementById('color-picker');
const randomColorToggle = document.getElementById('random-color');

window.colorConfig = {
  chosenColor: rgbToRGBA(hexToRGB(DEFAULT_COLOR)),
  randomColorChecked: randomColorToggle.checked,
};

/* Memory */

window.currentRun = 0;
window.appMemory = new Memory(
  rowsInput.value || HEIGHT,
  colsInput.value || WIDTH
);

/*
 Creates a Uint8ClampedArray from the current grid to use as the basis for the PNG  to export. More on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray
*/
function getBuffer(grid) {
  let buffer = appMemory.arrToBuffer();
  return buffer;
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
  const saveData = appMemory.arrToBuffer();
  if (saveData.length) {
    const dimensions = `${rowsInput.value}x${colsInput.value}/`;
    const dataToStore = dimensions + saveData;
    localStorage.setItem('pixel', dataToStore);
  }
}

const saveGrid = debounce(() => saveGridToLocalStorage());

/* 
Loads a grid from localStorage if present, 
 */
function loadGridFromLocalStorage() {
  const strOfGrid = localStorage.getItem('pixel');
  const arrOfGrid = strOfGrid.split('/');
  const gridSize = arrOfGrid.shift().split('x');
  rowsInput.value = gridSize[0];
  colsInput.value = gridSize[1];
  const bufferGrid = getCellArray(arrOfGrid[0]);
  createGrid(grid, bufferGrid, Number(gridSize[0]), Number(gridSize[1]));
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

/* Runs undo or redo functions based on whether CTRL + Z or CTRL + Y are pressed, and if there's data on undoStore/redoStore */
function handleKeyDown(e) {
  if (e.keyCode == 90 && e.ctrlKey && appMemory.undoStore.length) handleUndo();
  if (e.keyCode == 89 && e.ctrlKey && appMemory.redoStore.length) handleRedo();
}

function handleUndo(e) {
  appMemory.undo();
  if (appMemory.undoStore.length === 0) {
    undoBtn.disabled = true;
  }
  redoBtn.disabled = false;
}

function handleRedo() {
  appMemory.redo();
  if (appMemory.redoStore.length === 0) {
    redoBtn.disabled = true;
  }
  undoBtn.disabled = false;
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

  if (appMemory.intermediateMemory.length) {
    let change = appMemory.intermediateMemory.pop();
    appMemory.undoStore.push(change);
    appMemory.writeCellArray(change);
    undoBtn.disabled = false;
    if (appMemory.redoStore.length) {
      appMemory.redoStore.length = 0;
      redoBtn.disabled = true;
    }
  }
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
  colorConfig.chosenColor = rgbToRGBA(hexToRGB(e.target.value));
});

randomColorToggle.addEventListener('input', (e) => {
  colorConfig.randomColorChecked = randomColorToggle.checked;
});

clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  let rows = rowsInput.value;
  let cols = colsInput.value;
  if (rows > MAX_HEIGHT) rowsInput.value = MAX_HEIGHT;
  if (cols > MAX_WIDTH) colsInput.value = MAX_WIDTH;
  appMemory.initCellArray(rows, cols);
  createGrid(grid, appMemory.cellArray, rows || HEIGHT, cols || WIDTH);
});

//grid.addEventListener('click', handlePainting);

grid.addEventListener('mousedown', handleMousedown);

grid.addEventListener('contextmenu', handleClearing);

// Prevent dragging to avoid glitchy drawing

grid.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

undoBtn.addEventListener('click', handleUndo);
redoBtn.addEventListener('click', handleRedo);

/* Lifecycle */

createGrid(grid, appMemory.cellArray, HEIGHT, WIDTH);
