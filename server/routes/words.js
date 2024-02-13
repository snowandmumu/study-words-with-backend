import express from 'express';

import { getWords, createWord, updateWord, deleteWord } from '../controllers/words.js';

const router = express.Router();

router.get('/getWords', getWords);
// router.get('/getWords2', getWords2);
router.post('/createWord', createWord);
// router.post('/createWord2', createWord2);
// router.patch('/updateWord/:id', updateWord);
router.patch('/updateWord', updateWord);
// router.delete('/deleteWord/:id', deleteWord);
router.delete('/deleteWord', deleteWord);

export default router;