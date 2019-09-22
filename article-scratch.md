# Multiwords


## Install steps

### Create React App
`$ npx create-react-app multiwords`

### React Redux
`$ npm install redux react-redux redux-logger --save`

### React router
`$ npm install react-router-dom --save`

### Bootstrap
`$ npm install bootstrap --save`
`$ npm install node-sass --save`

### Utils
`$ npm install lodash --save`
`$ npm install classnames --save`

## Dev steps

```javascript
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import 'bootstrap/scss/bootstrap.scss';
```

### Dummy page components
```javascript
import React from 'react';

export const Lobby = () => {
  return <section>Lobby</section>;
};
```

Routing them:
```javascript
function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/lobby" component={Lobby} />
        <Route path="/room/:id" component={GameRoom} />
      </Router>
    </div>
  );
}
```

Game room with id
```javascript
import React from 'react';

export const GameRoom = ({ match }) => {
  return <section>GameRoom #{match.params.id}</section>;
};
```

Board with letters
```javascript
import React from 'react';
import PropTypes from 'prop-types';
import range from 'lodash/range';
import style from './Board.module.scss';

export const Board = ({ size }) => {
  return (
    <section className={style.board}>
      {range(size).map(row =>
        range(size).map(col => <div key={row + '_' + col}>{row},{col}</div>)
      )}
    </section>
  );
};

Board.propTypes = {
  size: PropTypes.number.isRequired
};

export default Board;
```

Then:
```javascript
import React from 'react';
import PropTypes from 'prop-types';
import range from 'lodash/range';

import {Letter} from "./Letter";
import style from './Board.module.scss';

export const Board = ({ size, letters }) => {
  return (
    <section className={style.board}>
      {range(size).map((row) =>
        range(size).map((col) =>
          <Letter key={row + '_' + col}>
            {letters[row * size + col]}
          </Letter>)
      )}
    </section>
  );
};

Board.propTypes = {
  size: PropTypes.number.isRequired,
  letters: PropTypes.array.isRequired
};

export default Board;

```

Gameroom:
```javascript
<Board size={3} letters={['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']} />
```

Board CSS grid:
```scss
@mixin board-grid-template($cell-count-in-row, $cell-size) {
  grid-template-rows: repeat($cell-count-in-row, $cell-size);
  grid-template-columns: repeat($cell-count-in-row, $cell-size);
}

.board {
  display: grid;
  grid-gap: 5px;

  &.board--3 {
    @include board-grid-template(3, 100px);
  }
}
```

Getting fancy:
```scss
$min-board-size: 3;
$max-board-size: 6;

@mixin board-grid-template($cell-count-in-row, $cell-size) {
  grid-template-rows: repeat($cell-count-in-row, $cell-size);
  grid-template-columns: repeat($cell-count-in-row, $cell-size);
}

.board {
  display: grid;
  grid-gap: 5px;

  @for $size from $min-board-size to $max-board-size {
    &.board--#{$size} {
      @include board-grid-template($size, 100px);
    }
  }
}
```

Letter:
```scss
.letter {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #C3D972;
  border: 1px solid #848C42;
  border-radius: 2px;
  color: #333;
  font-size: 80px;
}
```
```scss
@import "./variables";

.letter {
  align-items: center;
  background-color: $letter-background;
  border: 1px solid $letter-border-color;
  border-radius: 2px;
  color: $letter-color;
  cursor: pointer;
  display: flex;
  font-size: $letter-size * 0.8;
  justify-content: center;
  user-select: none;
}
```

### Redux:

Board reducer
```javascript
export const SELECTION_MODE = 'SELECTION_MODE';
export const selectionMode = enabled => ({ type: SELECTION_MODE, enabled });

const boardInitialState = {
  selectionMode: false
};

export function board(state = boardInitialState, action) {
  switch (action.type) {
    case SELECTION_MODE:
      return {...state, selectionMode: action.enabled};

    default:
      return state;
  }
}
```

Redux store
```javascript
import logger from 'redux-logger';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { board } from './board/state/board-state';

export default createStore(
  combineReducers({
    board
  }),
  applyMiddleware(logger)
);
```

Provider:
```javascript
import store from './redux-store';

function App() {
  return (
    <div className="container-fluid">
      <Provider store={store}>
        <Router>
          <Route path="/lobby" component={Lobby} />
          <Route path="/room/:id" component={GameRoom} />
        </Router>
      </Provider>
    </div>
  );
}
```

Connected board
```javascript
import {connect} from 'react-redux';
import { selectionMode } from './state/board-state';

export const ConnectedBoard = connect(
  (state) => ({}),
  (dispatch) => ({
    handleMouseDown: () => dispatch(selectionMode(true)),
    handleMouseUp: () => dispatch(selectionMode(false))
  })
)(Board);
```
