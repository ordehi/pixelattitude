/* Creates a grid given rows and cols integers for width and height */
export function createGrid(grid, cellArray, rows, cols) {
  grid.textContent = '';
  grid.style.setProperty('--grid-rows', rows);
  grid.style.setProperty('--grid-cols', cols);

  cellArray.map((cell, idx) => {
    let pixel = document.createElement('div');
    pixel.classList.add('cell');
    pixel.dataset.index = idx;
    pixel.dataset.run = 'initial';
    pixel.style.backgroundColor = `rgba(${cell.join(',')})`;
    grid.appendChild(pixel);
  });

  // for (let count = 0; count < rows * cols; count += 1) {
  //   let cell = document.createElement('div');
  //   cell.classList.add('cell');
  //   cell.id = 'cell-' + count;
  //   cell.dataset.run = 'initial';
  //   grid.appendChild(cell);
  // }
}

// function gridFromBuffer() {
//   let gridBuffer = new Uint8ClampedArray(32 * 32 * 4).fill(0);
//   let cellIdx = 0;
//   gridBuffer.reduce((prev, curr, idx) => {
//     if (idx % 4 === 0) {
//       cellIdx = idx / 4;
//     }

//     return prev;
//   }, []);
// }

// function bufferToArr(buffer) {
//   return Array.from(buffer);
// }

// function arrToBuffer(arr) {
//   return Uint8ClampedArray.from(arr);
// }

// function unflattenArray(arr, n) {
//   let copy = arr.concat();
//   let result = [];

//   while (copy.length) {
//     result.push(copy.splice(0, n));
//   }
//   return result;
// }

// let cellArray = unflattenArray(bufferToArr(buffer));
