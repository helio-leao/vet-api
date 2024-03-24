import mongoose from 'mongoose';


const examSchema = new mongoose.Schema({
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


export default mongoose.model('Exam', examSchema);