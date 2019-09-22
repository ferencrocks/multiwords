import {dropRight, isEqual, last} from "lodash";
import {coordsAreNeighbours, equalsCoord} from "../../utils/coord-utils";

export const SELECTION_MODE = 'SELECTION_MODE';
export const selectionMode = enabled => ({ type: SELECTION_MODE, enabled });

export const WORD_SELECTED = 'WORD_SELECTED';
export const wordSelected = () => ({ type: WORD_SELECTED });

export const LETTER_COORD_SELECTED = 'LETTER_COORD_SELECTED';
export const letterCoordSelected = ([row, col]) => ({ type: LETTER_COORD_SELECTED, coord: [row, col] });

const boardInitialState = {
  size: 4,
  selectionMode: false,
  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
  selectedLetterCoords: [],
  selectedWord: ''
};

export function board(state = boardInitialState, action) {
  switch (action.type) {
    case SELECTION_MODE:
      return {...state, selectionMode: action.enabled};

    case LETTER_COORD_SELECTED:
      const wasSelectedBeforeTheLastLetter = isEqual(state.selectedLetterCoords[state.selectedLetterCoords.length - 2], action.coord);
      const isSelectedLetter = state.selectedLetterCoords.find(equalsCoord(action.coord));

      if (
        state.selectedLetterCoords.length
        && (
          // The letter wasn't selected before, but it's not the last selected letter's neighbour
          (!isSelectedLetter && !coordsAreNeighbours(last(state.selectedLetterCoords), action.coord))
          // The letter was selected before, but it's not the previously selected one
          || (isSelectedLetter && !wasSelectedBeforeTheLastLetter)
        )
      ) {
        // don't do anything
        return {...state};
      }
      else if (wasSelectedBeforeTheLastLetter) {
        // The letter was selected before the current one --> deselect the current letter
        return {...state, selectedLetterCoords: dropRight(state.selectedLetterCoords)};
      }
      else {
        // Select the new letter
        return {...state, selectedLetterCoords: [...state.selectedLetterCoords, action.coord]};
      }

    case WORD_SELECTED:
      const selectedWord = state
        .selectedLetterCoords.map(([row, col]) => {
          return state.letters[row * state.size + col];
        })
        .join('');
      return {...state, selectedWord, selectedLetterCoords: []};

    default:
      return state;
  }
}
