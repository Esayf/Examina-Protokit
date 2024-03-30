const mongoose = require("mongoose");

const userAnswerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        },
        selectedOption: {
            type: Number,
            required: true,
        },
        answerHash: {
            type: String,
            required: true,
        },    
    }],
}, autoCreate = true,
);

module.exports = mongoose.model("Answer", userAnswerSchema);