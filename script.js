document.addEventListener('contextmenu', (event) => event.preventDefault());

const app = document.querySelector('.container');
const rows = document.getElementById('rows');
const cols = document.getElementById('cols');
const clearBtn = document.getElementById('clear-draw');
const colorPicker = document.getElementById('color-picker');
const randomColor = document.getElementById('random-color');
let color = colorPicker.value;
let randomColorChecked = randomColor.checked;

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

randomColor.addEventListener('input', (e) => {
  randomColorChecked = randomColor.checked;
});

clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  app.textContent = '';
  if (rows.value > 50) rows.value = 50;
  if (cols.value > 50) cols.value = 50;
  createGrid(rows.value || 32, cols.value || 32);
});

createGrid(32, 32);

app.addEventListener('click', (e) => {
  if (e.target.classList.contains('cell')) {
    e.target.style.backgroundColor = randomColorChecked ? randomRGBA() : color;
  }
});

app.addEventListener('contextmenu', (e) => {
  if (e.target.classList.contains('cell')) {
    e.target.style.backgroundColor = 'unset';
  }
});

function randomRGBA() {
  let r = random255();
  let g = random255();
  let b = random255();
  let a = Math.random().toFixed(1);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
