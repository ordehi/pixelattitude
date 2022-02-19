const app = document.querySelector('.container');
const rows = document.getElementById('rows');
const cols = document.getElementById('cols');
const clearBtn = document.getElementById('clear-draw');
const colorPicker = document.getElementById('color-picker');
const randomColorToggle = document.getElementById('random-color');
let color = colorPicker.value;
let randomColorChecked = randomColorToggle.checked;

const undoStore = [];
const redoStore = [];
const intermediateMemory = [];

let currentRun = 0;
/* 
Undo

When something is done, the cells and their respective colors are stored as an object inside undoStore with two properties, cells and colors. Each property contains an array with the values of all cells and their respective colors.

Since drag to paint will produce several cell-color pairs before the mouseup event, we should only push the values after the mouseup event, in the same listener that removes the listeners for the drag to paint action.

For the click to paint action, we can do the write to undoStore on the same handler that does the click

*/

/* Utility Functions */

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

function createGrid(rows, cols) {
  app.style.setProperty('--grid-rows', rows);
  app.style.setProperty('--grid-cols', cols);
  for (count = 0; count < rows * cols; count += 1) {
    let cell = document.createElement('div');
    cell.classList.add('cell');
    cell.id = 'cell-' + count;
    cell.dataset.run = 'initial';
    app.appendChild(cell);
  }
}

/* Event Handlers */

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
  e.target.style.backgroundColor = randomColorChecked ? randomRGBA() : color;
  if (prevColor !== e.target.style.backgroundColor) {
    writeIntermidiateMemory(e.target.id, prevColor);
  }
}

function clearCell(e) {
  let prevColor = e.target.style.backgroundColor || 'unset';
  e.target.style.backgroundColor = 'unset';
  if (prevColor !== e.target.style.backgroundColor) {
    writeIntermidiateMemory(e.target.id, prevColor);
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
    let prevColor = document.getElementById(action.cell).style.backgroundColor;
    document.getElementById(action.cell).style.backgroundColor = action.color;
    action.color = prevColor;
  }

  writeRedo(change);
}

function redo(e) {
  let change = redoStore.pop();
  for (const action of change) {
    console.log(action);
    document.getElementById(action.cell).style.backgroundColor = action.color;
  }
  console.log(change);
  writeUndo(change);
}

function updateCellRun(e) {
  e.target.dataset.run = currentRun;
}

function writeIntermidiateMemory(cell, color) {
  if (intermediateMemory.length === 0) intermediateMemory.push([]);
  intermediateMemory[0].push({ cell, color });
  console.log(intermediateMemory);
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
}

function removeListeners(e) {
  app.removeEventListener('mousemove', handlePainting);
  app.removeEventListener('mousemove', handleClearing);
  app.removeEventListener('mouseup', handleMouseup);
}

function handleMousedown(e) {
  currentRun += 1;
  if (isLeftClick(e)) {
    app.addEventListener('mousemove', handlePainting);
  } else if (isRightClick(e)) {
    app.addEventListener('mousemove', handleClearing);
  }

  app.addEventListener('mouseup', handleMouseup);
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
  app.textContent = '';
  if (rows.value > 50) rows.value = 50;
  if (cols.value > 50) cols.value = 50;
  createGrid(rows.value || 32, cols.value || 32);
});

//app.addEventListener('click', handlePainting);

app.addEventListener('mousedown', handleMousedown);

app.addEventListener('contextmenu', handleClearing);

// Prevent dragging to avoid glitchy drawing

app.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

/* Lifecycle */

createGrid(32, 32);
