import { FETCH_ALL_TEST_WORDS, UPDATE_TEST_WORDS} from '../constants/actionTypes';

export default (words = [], action) => {
  switch (action.type) {
    case FETCH_ALL_TEST_WORDS:
      return action.payload;
    case UPDATE_TEST_WORDS:
        return words.map((word) => (word._id === action.payload._id ? action.payload : word));
    default:
      return words;
  }
};

