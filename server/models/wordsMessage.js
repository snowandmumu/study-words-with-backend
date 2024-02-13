import mongoose from 'mongoose';

const WordsSchema = mongoose.Schema({
    // 单词名称
    text: String,
    // 最近一次学习时间
    updatedAt: {
        type: Number,
        default: (new Date()).getTime(),
    },
    // 状态 0表示未学习 1表示已学习 2表示已复习且会了 3表示已复习但不会 4表示已归档(学会了)
    status: {
        type: Number,
        default: 0,
    }
})

var WordsMessage = mongoose.model('WordsMessage', WordsSchema);

export default WordsMessage;