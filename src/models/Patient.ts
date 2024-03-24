import mongoose from 'mongoose';


const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    species: {
        type: String,
        lowercase: true,
    },
    breed: {
        type: String,
        lowercase: true,
    },
    tutorName: {
        type: String,
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


export default mongoose.model('Patient', patientSchema);