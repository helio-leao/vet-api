const mongoose = require('mongoose');


const examSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        lowercase: true,
    },
    unit: String,
    date: {
        type: Date,
        required: true,
    },
    result: {
        type: Number,
        required: true,
    },
    patient: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Patient',
        required: true,
    },
});


module.exports = mongoose.model('Exam', examSchema);