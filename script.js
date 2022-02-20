/* DOM */

const grid = document.querySelector('.container');
const rows = document.getElementById('rows');
const cols = document.getElementById('cols');

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

function random255() {
  return Math.floor(Math.random() * 255);
}

function randomRGBA() {
  let r = random255();
  let g = random255();
  let b = random255();
  let a = Math.random().toFixed(1);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function getRGB(str) {
  let match = str.match(
    /rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/
  );
  return match
    ? [Number(match[1]), Number(match[2]), Number(match[3]), 255]
    : [0, 0, 0, 0];
}

function getBuffer(grid) {
  return new Uint8ClampedArray(
    Array.from(grid.children)
      .map((cell) => {
        let color = cell.style.backgroundColor;

        if (color === '') {
          return [0, 0, 0, 0];
        } else {
          return getRGB(color);
        }
      })
      .flat()
  );
}

function getPNGFromBuffer(buffer) {
  let width = Number(rows.value);
  let height = Number(cols.value);

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

const download = (filename, data) => {
  let element = document.createElement('a');
  element.setAttribute('href', data);

  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

function downloadPNG() {
  let randomSuffix = new Date().getTime();
  download('pixel' + randomSuffix, getPNGFromBuffer(getBuffer(grid)));
}

const exportPNG = debounce(() => downloadPNG());

function createGrid(rows, cols) {
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

function saveGridToLocalStorage() {
  let saveData = Array.from(grid.children)
    .filter((cell) => !['', 'unset'].includes(cell.style.backgroundColor))
    .map((cell) => cell.id + '|' + cell.style.backgroundColor)
    .join('/');

  if (saveData.length) localStorage.setItem('pixel', saveData);
}

const saveGrid = debounce(() => saveGridToLocalStorage());

function loadGridFromLocalStorage() {
  let strOfGrid = localStorage.getItem('pixel');
  let arrOfGrid = strOfGrid.split('/');

  arrOfGrid.forEach((cell) => {
    document.getElementById(cell.split('|')[0]).style.backgroundColor =
      cell.split('|')[1];
  });
}

const loadGrid = debounce(() => loadGridFromLocalStorage());

/* Event Handlers */

document.onsubmit = (e) => e.preventDefault();

saveBtn.onclick = saveGrid;
loadBtn.onclick = loadGrid;
exportBtn.onclick = exportPNG;

function isLeftClick(e) {
  return e.button === 0;
}

function isRightClick(e) {
  return e.button === 2;
}

function isCellNotInRun(e) {
  return (
    e.target.classList.contains('cell') &&
    e.target.dataset.run !== String(currentRun)
  );
}

// The way we're checking against prevColor might introduce a bug with multiple undos

function paintCell(e) {
  let prevColor = e.target.style.backgroundColor || 'unset';
  let currColor = randomColorChecked ? randomRGBA() : color;

  if (prevColor !== e.target.style.backgroundColor) {
    e.target.style.backgroundColor = currColor;
    writeIntermidiateMemory(e.target.id, prevColor, currColor);
  }
}

function clearCell(e) {
  let prevColor = e.target.style.backgroundColor;
  let currColor = 'unset';

  if (prevColor !== undefined) {
    e.target.style.backgroundColor = currColor;
    writeIntermidiateMemory(e.target.id, prevColor, currColor);
  }
}

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

function handleKeyDown(e) {
  if (e.keyCode == 90 && e.ctrlKey && undoStore.length) undo(e);
  if (e.keyCode == 89 && e.ctrlKey && redoStore.length) redo(e);
}

// TODO: Refactor undo-redo to use objects that include both the current and previous color as properties

function undo(e) {
  let change = undoStore.pop();
  for (const action of change) {
    document.getElementById(action.cell).style.backgroundColor =
      action.prevColor;
  }

  writeRedo(change);
}

function redo(e) {
  let change = redoStore.pop();
  for (const action of change) {
    document.getElementById(action.cell).style.backgroundColor =
      action.currColor;
  }
  writeUndo(change);
}

function updateCellRun(e) {
  e.target.dataset.run = currentRun;
}

function writeIntermidiateMemory(cell, prevColor, currColor) {
  if (intermediateMemory.length === 0) intermediateMemory.push([]);
  intermediateMemory[0].push({ cell, prevColor, currColor });
}

function writeUndo(change) {
  undoStore.push(change);
}

function writeRedo(change) {
  redoStore.push(change);
}

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
  grid.textContent = '';
  if (rows.value > 50) rows.value = 50;
  if (cols.value > 50) cols.value = 50;
  createGrid(rows.value || 32, cols.value || 32);
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
