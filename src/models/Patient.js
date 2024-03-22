const mongoose = require('mongoose');


const patientSchema = mongoose.Schema({
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


module.exports = mongoose.model('Patient', patientSchema);