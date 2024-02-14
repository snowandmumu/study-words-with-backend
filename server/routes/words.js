import express from 'express';

import { getWords, createWord, updateWord, deleteWord } from '../controllers/words.js';

const router = express.Router();

router.get('/getWords', getWords);
router.post('/createWord', createWord);
router.patch('/updateWord', updateWord);
router.delete('/deleteWord', deleteWord);

export default router;