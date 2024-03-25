import mongoose, {Types} from 'mongoose';


export interface IExam {
    type: string,
    unit?: string,
    date: Date,
    result: number,
    patient: Types.ObjectId,
}

const examSchema = new mongoose.Schema<IExam>({
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


export default mongoose.model<IExam>('Exam', examSchema);