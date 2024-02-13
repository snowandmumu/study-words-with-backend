import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import { reducers } from './reducers';
import App from './App';
import Card from './components/Card';
import Review from './components/Review';
import Test from './components/Test'

import './index.css';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

ReactDOM.render(
  <Provider store={store}>
    {/* <App /> */}
    <Router>
      <Routes>
        <Route path="/" element={<Card />}/>
        <Route path="review" element={<Review />}/>
        <Route path="test" element={<Test />}/>
        <Route path="memory" element={<App />}/>
        <Route path="*" element={<App />}/>
      </Routes>
    </Router>
  </Provider>,
  document.getElementById('root'),
);
