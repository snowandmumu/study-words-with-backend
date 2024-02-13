import axios from 'axios';

const url = 'http://localhost:5000/words';

export const fetchWords = params => {
    return axios.get(`${url}/getWords`, {params});
};
export const createWord = (newWord) => {
    return axios.post(`${url}/createWord`, newWord)
};
export const updateWord = (id, updatedWord) => {
    return axios.patch(`${url}/updateWord/${id}`, updatedWord);
};
export const deleteWord = (id) => {
    return axios.delete(`${url}/deleteWord/${id}`)
};
