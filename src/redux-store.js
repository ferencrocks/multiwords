import { createStore, combineReducers, applyMiddleware } from 'redux';
import logger from 'redux-logger';

import { board } from './board/state/board-state';

export default createStore(
  combineReducers({
    board
  }),
  applyMiddleware(logger)
);
