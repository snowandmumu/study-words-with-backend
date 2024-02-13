import { FETCH_ALL_WORDS, CREATE_WORDS, DELETE_WORDS, UPDATE_WORDS } from '../constants/actionTypes';

// import * as api from '../api/words.js';

export const getWordsAction = payload => {
  return { type: FETCH_ALL_WORDS, payload }
};

export const createWordAction = payload => {
  return { type: CREATE_WORDS, payload };
};

export const updateWordAction = payload => {
  return { type: UPDATE_WORDS, payload };
};

// export const deleteWord = (id) => async (dispatch) => {
//   try {
//     await api.deleteWord(id);

//     dispatch({ type: DELETE_WORDS, payload: id });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

