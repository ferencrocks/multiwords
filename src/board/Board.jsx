import React from 'react';
import PropTypes from 'prop-types';
import range from 'lodash/range';
import classNames from 'classnames';
import {connect} from 'react-redux';

import Letter from "./Letter";
import { selectionMode, letterCoordSelected, wordSelected } from './state/board-state';
import { equalsCoord } from "../utils/coord-utils";
import style from './Board.module.scss';


export const Board = ({ size, letters, selectedLetterCoords, selectionMode, enableSelectionMode, disableSelectionMode, handleLetterSelection }) => {
  let boardBounds;

  const letterCoordByTouchPosition = (touch) => {
    const {clientX, clientY} = touch.targetTouches[0];
    const letterSize = boardBounds.width / size;
    const row = Math.floor((clientY - boardBounds.top) / letterSize);
    const col = Math.floor((clientX - boardBounds.left) / letterSize);
    return [row, col];
  };

  const letterTouchedInTouchArea = ([row, col], touch) => {
    const letterSize = boardBounds.width / size;
    const touchAreaPadding = 0.15 * letterSize;
    const area = {
      top: boardBounds.top + row * letterSize + touchAreaPadding,
      bottom: boardBounds.top + (row + 1) * letterSize - touchAreaPadding,
      left: boardBounds.left + col * letterSize + touchAreaPadding,
      right: boardBounds.left + (col + 1) * letterSize - touchAreaPadding
    };

    const {clientX, clientY} = touch.targetTouches[0];
    return clientX >= area.left
      && clientX <= area.right
      && clientY >= area.top
      && clientY <= area.bottom;
  };

  const handleLetterTouch = (touch) => {
    const letterCoord = letterCoordByTouchPosition(touch);
    if (letterTouchedInTouchArea(letterCoord, touch)) {
      handleLetterSelection(letterCoord);
    }
  };

  return (
    <section
      className={classNames(style.board, style['board--' + size])}
      onMouseUp={disableSelectionMode}
      onTouchStart={handleLetterTouch}
      onTouchMove={handleLetterTouch}
      onTouchEnd={disableSelectionMode}
      ref={element => element && (boardBounds = element.getBoundingClientRect())}>
      {range(size).map((row) =>
        range(size).map((col) =>
          <Letter
            row={row}
            col={col}
            letter={letters && letters[row * size + col]}
            selected={selectedLetterCoords.some(equalsCoord([row, col]))}
            handleMouseDown={enableSelectionMode}
            handleMouseEnter={(coord) => selectionMode && handleLetterSelection(coord)}
            key={`${row}_${col}`}
          />
        )
      )}
    </section>
  );
};
Board.propTypes = {
  size: PropTypes.number.isRequired,
  letters: PropTypes.array.isRequired,
  enableSelectionMode: PropTypes.array.isRequired,
  disableSelectionMode: PropTypes.array.isRequired,
  handleLetterSelection: PropTypes.array.isRequired
};

export const ConnectedBoard = connect(
  (state) => ({
    size: state.board.size,
    letters: state.board.letters,
    selectionMode: state.board.selectionMode,
    selectedLetterCoords: state.board.selectedLetterCoords
  }),
  (dispatch) => ({
    enableSelectionMode: (coord) => {
      dispatch(selectionMode(true));
      dispatch(letterCoordSelected(coord));
    },
    disableSelectionMode: () => {
      dispatch(selectionMode(false));
      dispatch(wordSelected());
    },
    handleLetterSelection: (coord) => {
      dispatch(letterCoordSelected(coord))
    }
  })
)(Board);
export default ConnectedBoard;
