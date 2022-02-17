const app = document.querySelector('.container');
const rows = document.getElementById('rows');
const cols = document.getElementById('cols');
const clearBtn = document.getElementById('clear-draw');
const colorPicker = document.getElementById('color-picker');
const randomColorToggle = document.getElementById('random-color');
let color = colorPicker.value;
let randomColorChecked = randomColorToggle.checked;

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
    cell.classList.add('cell-' + count);
    app.appendChild(cell);
  }
}

/* Event Handlers */

function isLeftClick(e) {
  return e.buttons === 1;
}

function isRightClick(e) {
  return e.buttons === 2;
}

function isCell(e) {
  return e.target.classList.contains('cell');
}

function paintCell(e) {
  e.target.style.backgroundColor = randomColorChecked ? randomRGBA() : color;
}

function clearCell(e) {
  e.target.style.backgroundColor = 'unset';
}

function handlePainting(e) {
  if (isCell(e)) paintCell(e);
}

function handleClearing(e) {
  e.preventDefault();
  if (isCell(e)) clearCell(e);
}

/* Event Listeners */

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

app.addEventListener('click', handlePainting);

app.addEventListener('mousedown', (e) => {
  if (isLeftClick(e)) {
    app.addEventListener('mousemove', handlePainting);
  } else if (isRightClick(e)) {
    app.addEventListener('mousemove', handleClearing);
  }
});

app.addEventListener('mouseup', (e) => {
  app.removeEventListener('mousemove', handlePainting);
  app.removeEventListener('mousemove', handleClearing);
});

app.addEventListener('contextmenu', handleClearing);

// Prevent dragging to avoid glitchy drawing

app.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

/* Lifecycle */

createGrid(32, 32);
