import { FETCH_ALL_TEST_WORDS, UPDATE_TEST_WORDS} from '../constants/actionTypes';

export const getWordsAction = payload => {
    return { type: FETCH_ALL_TEST_WORDS, payload }
};

export const updateWordAction = payload => {
    return { type: UPDATE_TEST_WORDS, payload };
};
