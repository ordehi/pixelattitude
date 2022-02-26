// import { MemoryController } from './MemoryController.js';
// const { writeIntermidiateMemory } = MemoryController;

/* 
Stores the previous color of the current cell, and determines the current color to replace the previous by either using the selected color in the GUI or a random RGBA value if Use Random Color is checked in the GUI. Only paints if the previous color is not the same as the current color (we probably need to change this)
 */
export function paintCell(e, color) {
  e.target.style.backgroundColor = color;
}

/* Clears a cell from color which currently happens when right-click is pressed on a cell (or held and moused over multiple cells). We probably want to abstract the prevColor - currColor deal to a separate process */
export function clearCell(e) {
  e.target.style.backgroundColor = '';
}
