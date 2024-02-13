import { combineReducers } from 'redux';

import posts from './posts';
import words from './words';
import reviewWords from './reviewWords';
import testWords from './testWords';

export const reducers = combineReducers({
    posts,
    words,
    reviewWords,
    testWords
});
