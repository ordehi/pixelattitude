/* Creates a grid given rows and cols integers for width and height */
export function createGrid(grid, rows, cols) {
  grid.textContent = '';
  grid.style.setProperty('--grid-rows', rows);
  grid.style.setProperty('--grid-cols', cols);
  for (let count = 0; count < rows * cols; count += 1) {
    let cell = document.createElement('div');
    cell.classList.add('cell');
    cell.id = 'cell-' + count;
    cell.dataset.run = 'initial';
    grid.appendChild(cell);
  }
}
