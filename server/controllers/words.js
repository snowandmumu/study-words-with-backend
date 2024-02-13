import express from 'express';
import mongoose from 'mongoose';

import WordsMessage from '../models/wordsMessage.js';

const router = express.Router();

// export const getWords = async (req, res) => { 
//     const originalParams = req.query
//     try {
//         const params = {};
//         const {startTime, endTime, status} = originalParams;
//         if (startTime && startTime) {
//             params.updatedAt = { $gt: startTime, $lt: endTime }
//         }
//         if (status) {
//             params.status = {$in: status}
//         }
//         const wordsMessages = await WordsMessage.find(params);
                
//         res.status(200).json(wordsMessages);
//     } catch (error) {
//         res.status(404).json({ message: error.message });
//     }
// }

export const getWords = async (req, res) => { 
    const originalParams = req.query
    try {
        const params = {};
        const {startTime, endTime, status} = originalParams;
        if (startTime && startTime) {
            params.updatedAt = { $gt: startTime, $lt: endTime }
        }
        if (status) {
            params.status = {$in: status}
        }
        const wordsMessages = await WordsMessage.find(params);
                
        res.status(200).json({code: 0, data: wordsMessages});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// export const createWord = async (req, res) => {
//     const { text } = req.body;

//     const newWord = new WordsMessage({ text });

//     try {
//         await newWord.save();

//         res.status(201).json(newWord);
//     } catch (error) {
//         res.status(409).json({ message: error.message });
//     }
// }

export const createWord = async (req, res) => {
    const { text } = req.body;

    const newWord = new WordsMessage({ text });

    try {
        await newWord.save();
        res.status(200).json({code: 0, data: newWord});
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

// export const updateWord = async (req, res) => {
//     const { id } = req.params;
//     const { text, updatedAt, status} = req.body;
    
//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No word with id: ${id}`);

//     const updatedWord = { _id: id, text, updatedAt, status};

//     await WordsMessage.findByIdAndUpdate(id, updatedWord, { new: true });

//     res.json(updatedWord);
// }

export const updateWord = async (req, res) => {
    const { _id, text, updatedAt, status} = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(`No word with id: ${_id}`);

    const updatedWord = { _id, text, updatedAt, status};

    await WordsMessage.findByIdAndUpdate(_id, updatedWord, { new: true });

    res.json({code: 0, data: updatedWord});
}

// export const deleteWord = async (req, res) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No word with id: ${id}`);

//     await WordsMessage.findByIdAndRemove(id);

//     res.json({ message: "word deleted successfully." });
// }

export const deleteWord = async (req, res) => {
    const { _id} = req.query;

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(`No word with id: ${_id}`);

    await WordsMessage.findByIdAndRemove(_id);

    res.json({code: 0, message: "word deleted successfully." });
}

export default router;
