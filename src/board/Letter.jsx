import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './Letter.module.scss';


export const Letter = ({ row, col, letter, selected, handleMouseDown, handleMouseEnter }) => {
  return (
    <div
      className={classNames({[style.letter]: true, [style.selected]: selected })}
      onMouseDown={() => handleMouseDown([row, col])}>
      <span
        className={style.mouseEnterArea}
        onMouseEnter={() => handleMouseEnter([row, col])}>
        {letter}
      </span>
    </div>
  );
};
Letter.propTypes = {
  letter: PropTypes.string.isRequired,
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  selectionMode: PropTypes.bool,
  handleMouseDown: PropTypes.func,
  handleMouseEnter: PropTypes.func
};

export default Letter;
