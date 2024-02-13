import { FETCH_ALL_REVIEW_WORDS, UPDATE_REVIEW_WORDS} from '../constants/actionTypes';

// import * as api from '../api/reviewWords.js';

export const getWordsAction = payload => {
    return { type: FETCH_ALL_REVIEW_WORDS, payload }
};

export const updateWordAction = payload => {
    return { type: UPDATE_REVIEW_WORDS, payload };
};
