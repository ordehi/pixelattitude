export class Memory {
  undoStore = [];
  redoStore = [];
  intermediateMemory = [];

  writeIntermidiateMemory(change) {
    if (this.intermediateMemory.length === 0) this.intermediateMemory.push([]);
    this.intermediateMemory[0].push(change);
  }

  // undo(change) {
  //   this.undoStore.push(change);
  // }

  // redo(change) {
  //   this.redoStore.push(change);
  // }

  // intermediate(change) {
  //   if (this.intermediateMemory.length === 0) this.intermediateMemory.push([]);
  //   this.intermediateMemory[0].push(change);
  // }
}

// export const MemoryController = {
//   /* Writes an intermediate memory that is a store of all the cells being painted while mousedown is held, once mouseup happens, we commit intermediateMemory to undoStore */
//   writeIntermidiateMemory: (change) => {
//     if (intermediateMemory.length === 0) intermediateMemory.push([]);
//     intermediateMemory[0].push(change);
//   },

//   /* writeUndo and writeRedo push intermediateMemory to their respective stores */
//   writeUndo: (change) => {
//     undoStore.push(change);
//   },

//   writeRedo: (change) => {
//     redoStore.push(change);
//   },
// };
