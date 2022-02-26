export class Memory {
  undoStore = [];
  redoStore = [];
  intermediateMemory = [];

  writeIntermidiateMemory(change) {
    if (this.intermediateMemory.length === 0) this.intermediateMemory.push([]);
    this.intermediateMemory[0].push(change);
  }

  /* undoes the last cell by getting the relevant data from undoStore and painting the grid with it */
  undo() {
    let change = this.undoStore.pop();
    for (const cell of change) {
      document.getElementById(cell.id).style.backgroundColor = cell.prevColor;
    }
    this.redoStore.push(change);
  }

  /* redoes last undo, only works if no cell has been done after the last undo */
  redo() {
    let change = this.redoStore.pop();
    for (const cell of change) {
      document.getElementById(cell.id).style.backgroundColor = cell.currColor;
    }
    this.undoStore.push(change);
  }
}
