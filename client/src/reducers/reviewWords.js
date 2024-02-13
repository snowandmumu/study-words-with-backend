import { FETCH_ALL_REVIEW_WORDS, UPDATE_REVIEW_WORDS} from '../constants/actionTypes';

export default (words = [], action) => {
  switch (action.type) {
    case FETCH_ALL_REVIEW_WORDS:
      return action.payload;
    case UPDATE_REVIEW_WORDS:
        return words.map((word) => (word._id === action.payload._id ? action.payload : word));
    default:
      return words;
  }
};

