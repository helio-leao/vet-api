import mongoose, { Types } from 'mongoose';


export interface IPatient {
    name: string,
    species: 'canina' | 'felina',
    breed?: string,
    tutorName: string,
    pictureUrl?: string,
    healthDescription?: string,
    birthdate?: Date,
    user: Types.ObjectId,
}

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    species: {
        type: String,
        enum: ['canina', 'felina'],
        required: true,
        lowercase: true,
    },
    breed: {
        type: String,
        lowercase: true,
    },
    tutorName: {
        type: String,
        required: true,
        lowercase: true,
    },
    pictureUrl: String,
    healthDescription: String,
    birthdate: Date,
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
});


export default mongoose.model<IPatient>('Patient', patientSchema);