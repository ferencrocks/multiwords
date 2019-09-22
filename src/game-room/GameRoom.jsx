import React from 'react';
import PropTypes from 'prop-types';

import Board from "../board/Board";


export const GameRoom = () => {
  return (
    <div>
      <Board />
    </div>
  );
};
GameRoom.propTypes = {
  boardSize: PropTypes.number
};

export default GameRoom;
