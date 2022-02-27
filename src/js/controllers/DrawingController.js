/* Checks if the current cell being moused over is in the current run (the current painting movement before the mouseup event), this is to prevent trying to paint over a cell multiple times and filling up memory with duplicates */
import {
  rgbToRGBA,
  randomRGBA,
  getCellId,
  isNotInRun,
  updateCellRun,
} from '../Helpers.js';

function isCell(e) {
  return e.target.classList.contains('cell');
}

function getColors(e, isClearing = false) {
  let prevColor =
    rgbToRGBA(e.target.style.backgroundColor) || 'rgba(0, 0, 0, 0)';
  return isClearing
    ? { prevColor, currColor: 'rgba(0, 0, 0, 0)' }
    : {
        prevColor,
        currColor: colorConfig.randomColorChecked
          ? randomRGBA()
          : colorConfig.chosenColor,
      };
}

function colorsAreDifferent(colors) {
  return colors.currColor !== colors.prevColor;
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

function updateCellAndMemory(e, colors, id) {
  updateCellRun(e);
  paintCell(e, colors.currColor);
  appMemory.writeIntermidiateMemory({ id, ...colors });
}

export function handlePainting(e) {
  if ((isCell(e) && isNotInRun(e)) || colorConfig.randomColorChecked) {
    let colors = getColors(e, false);
    if (colorsAreDifferent(colors)) {
      updateCellAndMemory(e, colors, getCellId(e));
    }
  }
}

export function handleClearing(e) {
  e.preventDefault();
  if (isCell(e) && isNotInRun(e)) {
    let colors = getColors(e, true);
    if (colorsAreDifferent(colors)) {
      updateCellAndMemory(e, colors, getCellId(e));
    }
  }
}
