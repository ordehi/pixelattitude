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
let color = colorPicker.value;
let randomColorChecked = randomColorToggle.checked;

/* Memory */

const undoStore = [];
const redoStore = [];
const intermediateMemory = [];

let currentRun = 0;

/* Utility Functions */

/* 
To prevent multiple consecutive writes/reads from storage
Idea from https://www.freecodecamp.org/news/javascript-debounce-example/
 */
function debounce(func, timeout = 300) {
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
function random255() {
  return Math.floor(Math.random() * 255);
}

/* Get a random RGBA value */
function randomRGBA() {
  let r = random255();
  let g = random255();
  let b = random255();
  let a = Math.random().toFixed(1);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* Extract RGB values from a string */
function extractRGB(str) {
  let match = str.match(
    /rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/
  );
  return match
    ? [Number(match[1]), Number(match[2]), Number(match[3]), 255]
    : [0, 0, 0, 0];
}

/*
 Creates a Uint8ClampedArray from the current grid to use as the basis for the PNG  to export. More on MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray
*/
function getBuffer(grid) {
  return new Uint8ClampedArray(
    Array.from(grid.children)
      .map((cell) => {
        let color = cell.style.backgroundColor;

        if (color === '') {
          return [0, 0, 0, 0];
        } else {
          return extractRGB(color);
        }
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

/* Creates a grid given rows and cols integers for width and height */
function createGrid(rows, cols) {
  grid.textContent = '';
  grid.style.setProperty('--grid-rows', rows);
  grid.style.setProperty('--grid-cols', cols);
  for (count = 0; count < rows * cols; count += 1) {
    let cell = document.createElement('div');
    cell.classList.add('cell');
    cell.id = 'cell-' + count;
    cell.dataset.run = 'initial';
    grid.appendChild(cell);
  }
}

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
  return e.button === 0;
}

function isRightClick(e) {
  return e.button === 2;
}

/* Checks if the current cell being moused over is in the current run (the current painting movement before the mouseup event), this is to prevent trying to paint over a cell multiple times and filling up memory with duplicates */
function isCellNotInRun(e) {
  return (
    e.target.classList.contains('cell') &&
    e.target.dataset.run !== String(currentRun)
  );
}

/* 
Stores the previous color of the current cell, and determines the current color to replace the previous by either using the selected color in the GUI or a random RGBA value if Use Random Color is checked in the GUI. Only paints if the previous color is not the same as the current color (we probably need to change this)
 */
function paintCell(e) {
  let prevColor = e.target.style.backgroundColor || 'unset';
  let currColor = randomColorChecked ? randomRGBA() : color;

  if (prevColor !== e.target.style.backgroundColor) {
    e.target.style.backgroundColor = currColor;
    writeIntermidiateMemory(e.target.id, prevColor, currColor);
  }
}

/* Clears a cell from color which currently happens when right-click is pressed on a cell (or held and moused over multiple cells). We probably want to abstract the prevColor - currColor deal to a separate process */
function clearCell(e) {
  let prevColor = e.target.style.backgroundColor;
  let currColor = 'unset';

  if (prevColor !== undefined) {
    e.target.style.backgroundColor = currColor;
    writeIntermidiateMemory(e.target.id, prevColor, currColor);
  }
}

/* Paints only if the current cell hasn't been painted over during the current run. This is probably the root of the not being able to paint over painted cells issue #1 */
function handlePainting(e) {
  if (isCellNotInRun(e)) {
    updateCellRun(e);
    paintCell(e);
  }
}

function handleClearing(e) {
  e.preventDefault();
  if (isCellNotInRun(e)) {
    updateCellRun(e);
    clearCell(e);
  }
}

/* Runs undo or redo functions based on whether CTRL + Z or CTRL + Y are pressed, and if there's data on undoStore/redoStore */
function handleKeyDown(e) {
  if (e.keyCode == 90 && e.ctrlKey && undoStore.length) undo(e);
  if (e.keyCode == 89 && e.ctrlKey && redoStore.length) redo(e);
}

/* undoes the last action by getting the relevant data from undoStore and painting the grid with it */
function undo(e) {
  let change = undoStore.pop();
  for (const action of change) {
    document.getElementById(action.cell).style.backgroundColor =
      action.prevColor;
  }
  writeRedo(change);
}

/* redoes last undo, only works if no action has been done after the last undo */
function redo(e) {
  let change = redoStore.pop();
  for (const action of change) {
    document.getElementById(action.cell).style.backgroundColor =
      action.currColor;
  }
  writeUndo(change);
}

/* Updates the currentRun variable, which represents the current painting movement being carried out to prevent the same cells from being painted multiple times. Likely involved in Issue #1 */
function updateCellRun(e) {
  e.target.dataset.run = currentRun;
}

/* Writes an intermediate memory that is a store of all the cells being painted while mousedown is held, once mouseup happens, we commit intermediateMemory to undoStore */
function writeIntermidiateMemory(cell, prevColor, currColor) {
  if (intermediateMemory.length === 0) intermediateMemory.push([]);
  intermediateMemory[0].push({ cell, prevColor, currColor });
}

/* writeUndo and writeRedo push intermediateMemory to their respective stores */
function writeUndo(change) {
  undoStore.push(change);
}

function writeRedo(change) {
  redoStore.push(change);
}

/* We need to remove event listeners that paint and clear cells once we hear mouseup because otherwise you might end up painting indefinitely, or clearing when you meant to paint. There's probably a solution we should adopt instead of this. */
function handleMouseup(e) {
  removeListeners(e);

  if (!intermediateMemory.length) {
    if (isLeftClick(e)) {
      handlePainting(e);
    } else if (isRightClick(e)) {
      handleClearing(e);
    }
  }
  writeUndo(intermediateMemory.pop());
  if (redoStore.length) redoStore.length = 0;
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
  color = e.target.value;
});

randomColorToggle.addEventListener('input', (e) => {
  randomColorChecked = randomColorToggle.checked;
});

clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (rowsInput.value > 100) rowsInput.value = 100;
  if (colsInput.value > 100) colsInput.value = 100;
  createGrid(rowsInput.value || 32, colsInput.value || 32);
});

//grid.addEventListener('click', handlePainting);

grid.addEventListener('mousedown', handleMousedown);

grid.addEventListener('contextmenu', handleClearing);

// Prevent dragging to avoid glitchy drawing

grid.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

/* Lifecycle */

createGrid(32, 32);
