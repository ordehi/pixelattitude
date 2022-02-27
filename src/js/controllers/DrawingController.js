/* Checks if the current cell being moused over is in the current run (the current painting movement before the mouseup event), this is to prevent trying to paint over a cell multiple times and filling up memory with duplicates */
import { randomRGBA } from '../Helpers.js';

function isCell(e) {
  return e.target.classList.contains('cell');
}

// TODO: Fix comparing colors from hex to rgb
function getColors(e, isClearing = false, random, color) {
  let prevColor = e.target.style.backgroundColor || '';
  return isClearing
    ? { prevColor, currColor: '' }
    : { prevColor, currColor: random ? randomRGBA() : color };
}

function colorsAreDifferent(colors) {
  return colors.currColor !== colors.prevColor;
}

/* Updates the currentRun variable, which represents the current painting movement being carried out to prevent the same cells from being painted multiple times. Likely involved in Issue #1 */
function updateCellRun(e) {
  e.target.dataset.run = currentRun;
}

/* 
Stores the previous color of the current cell, and determines the current color to replace the previous by either using the selected color in the GUI or a random RGBA value if Use Random Color is checked in the GUI. Only paints if the previous color is not the same as the current color (we probably need to change this)
 */
function paintCell(e, color) {
  e.target.style.backgroundColor = color;
}

/* Clears a cell from color which currently happens when right-click is pressed on a cell (or held and moused over multiple cells). We probably want to abstract the prevColor - currColor deal to a separate process */
function clearCell(e) {
  e.target.style.backgroundColor = '';
}

/* Paints only if the current cell hasn't been painted over during the current run. This is probably the root of the not being able to paint over painted cells issue #1 */
export function handlePainting(e) {
  if (isCell(e)) {
    let colors = getColors(
      e,
      false,
      colorConfig.randomColorChecked,
      colorConfig.chosenColor
    );
    if (colorsAreDifferent(colors)) {
      let id = e.target.id;
      updateCellRun(e);
      paintCell(e, colors.currColor);
      appMemory.writeIntermidiateMemory({ id, ...colors });
    }
  }
}

export function handleClearing(e) {
  e.preventDefault();
  if (isCell(e)) {
    let colors = getColors(e, true);
    if (colorsAreDifferent(colors)) {
      let id = e.target.id;
      updateCellRun(e);
      clearCell(e);
      appMemory.writeIntermidiateMemory({ id, ...colors });
    }
  }
}
