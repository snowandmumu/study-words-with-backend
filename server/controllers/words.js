import express from 'express';
import mongoose from 'mongoose';

import WordsMessage from '../models/wordsMessage.js';

const router = express.Router();

export const getWords = async (req, res) => { 
    const originalParams = req.query
    try {
        const params = {};
        const {startTime, endTime, count, testCount} = originalParams;
        if (startTime && startTime) {
            params.updatedAt = { $gt: startTime, $lt: endTime }
        }
        if (count) {
            params.count = JSON.parse(count);
        }
        if (testCount) {
            params.testCount = JSON.parse(testCount);
        }
        const wordsMessages = await WordsMessage.find(params);
                
        res.status(200).json({code: 0, data: wordsMessages});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

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

export const updateWord = async (req, res) => {
    const { _id, text, updatedAt, count, testCount} = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(`No word with id: ${_id}`);

    const updatedWord = { _id, text, updatedAt, count, testCount};

    await WordsMessage.findByIdAndUpdate(_id, updatedWord, { new: true });

    res.json({code: 0, data: updatedWord});
}

export const deleteWord = async (req, res) => {
    const { _id} = req.query;

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(`No word with id: ${_id}`);

    await WordsMessage.findByIdAndRemove(_id);

    res.json({code: 0, message: "word deleted successfully." });
}

export default router;
