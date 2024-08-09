const mongoose = require('mongoose');

const resetcodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    resetCode: {
        type: Number,
        required: true,
    },
});

const ResetCode = mongoose.model('resetcodes', resetcodeSchema);
module.exports = ResetCode;