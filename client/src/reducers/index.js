import { combineReducers } from 'redux';

import words from './words';
import reviewWords from './reviewWords';
import testWords from './testWords';

export const reducers = combineReducers({
    words,
    reviewWords,
    testWords
});
