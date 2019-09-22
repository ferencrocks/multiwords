import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from 'react-redux';

import './App.css';
import store from './redux-store';
import {GameRoom} from "./game-room/GameRoom";
import {Lobby} from "./lobby/Lobby";


function App() {
  return (
    <Provider store={store}>
      <Router>
        <Route path="/lobby" component={Lobby} />
        <Route path="/room/:id" component={GameRoom} />
      </Router>
    </Provider>
  );
}
export default App;
