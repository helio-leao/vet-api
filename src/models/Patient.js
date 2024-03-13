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
    birthdate: Date,
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
});

module.exports = mongoose.model('Patient', patientSchema);