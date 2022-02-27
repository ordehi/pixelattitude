import { rgbStrToArr } from '../Helpers.js';

export class Memory {
  undoStore = [];
  redoStore = [];
  intermediateMemory = [];
  cellArray;

  constructor(rows, cols) {
    this.cellArray = new Array(rows * cols).fill([0, 0, 0, 0]);
  }

  initCellArray(rows, cols) {
    this.cellArray = new Array(rows * cols).fill([0, 0, 0, 0]);
  }

  writeCellArray(data) {
    data.map((cell) => {
      this.cellArray[Number(cell.id.substring(2))] = rgbStrToArr(
        cell.currColor
      );
    });
  }

  arrToBuffer() {
    return Uint8ClampedArray.from(this.cellArray.flat());
  }

  writeIntermidiateMemory(change) {
    if (this.intermediateMemory.length === 0) this.intermediateMemory.push([]);
    this.intermediateMemory[0].push(change);
  }

  /* undoes the last cell by getting the relevant data from undoStore and painting the grid with it */
  undo() {
    let change = this.undoStore.pop();
    for (const cell of change) {
      document.getElementById(cell.id).style.backgroundColor = cell.prevColor;
      [cell.prevColor, cell.currColor] = [cell.currColor, cell.prevColor];
    }
    this.redoStore.push(change);
    this.writeCellArray(change);
  }

  /* redoes last undo, only works if no cell has been done after the last undo */
  redo() {
    let change = this.redoStore.pop();
    for (const cell of change) {
      document.getElementById(cell.id).style.backgroundColor = cell.prevColor;
      [cell.prevColor, cell.currColor] = [cell.currColor, cell.prevColor];
    }
    this.undoStore.push(change);
    this.writeCellArray(change);
  }
}
