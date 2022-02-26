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

export const saveGrid = debounce(() => saveGridToLocalStorage());

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

export const loadGrid = debounce(() => {
  if (localStorage.getItem('pixel')) loadGridFromLocalStorage();
});
