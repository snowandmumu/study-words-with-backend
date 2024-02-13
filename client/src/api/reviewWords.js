import axios from 'axios';

const url = 'http://localhost:5000/words';

export const fetchWords = params => {
    return axios.get(`${url}/getWords`, {params});
};
