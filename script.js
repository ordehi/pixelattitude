document.addEventListener('contextmenu', (event) => event.preventDefault());

const app = document.querySelector('.container');
const rows = document.getElementById('rows');
const cols = document.getElementById('cols');
const clearBtn = document.getElementById('clear-draw');
const colorPicker = document.getElementById('color-picker');
const randomColorToggle = document.getElementById('random-color');
let color = colorPicker.value;
let randomColorChecked = randomColorToggle.checked;

function random255() {
  return Math.floor(Math.random() * 255);
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

createGrid(32, 32);

function isCell(e) {
  return e.target.classList.contains('cell');
}

function paintCell(e) {
  e.target.style.backgroundColor = randomColorChecked ? randomRGBA() : color;
}

function handlePainting(e) {
  if (isCell(e)) {
    paintCell(e);
  }
}

app.addEventListener('click', handlePainting);

app.addEventListener('mousedown', (e) => {
  app.addEventListener('mousemove', handlePainting);
});

app.addEventListener('mouseup', (e) => {
  app.removeEventListener('mousemove', handlePainting);
  console.log('removed move');
});

app.addEventListener('contextmenu', (e) => {
  if (e.target.classList.contains('cell')) {
    e.target.style.backgroundColor = 'unset';
  }
});

function clearCell() {
  e.target.style.backgroundColor = 'unset';
}

function randomRGBA() {
  let r = random255();
  let g = random255();
  let b = random255();
  let a = Math.random().toFixed(1);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
