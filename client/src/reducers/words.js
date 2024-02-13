import { FETCH_ALL_WORDS, CREATE_WORDS, UPDATE_WORDS, DELETE_WORDS} from '../constants/actionTypes';

export default (words = [], action) => {
  switch (action.type) {
    case FETCH_ALL_WORDS:
      return action.payload;
    case CREATE_WORDS:
      return [...words, action.payload];
    case UPDATE_WORDS:
      return words.map((word) => (word._id === action.payload._id ? action.payload : word));
    case DELETE_WORDS:
      return words.filter((word) => word._id !== action.payload);
    default:
      return words;
  }
};

