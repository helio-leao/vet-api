const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    name: String,
    species: String,
    breed: String,
    birthdate: Date,
    user: mongoose.SchemaTypes.ObjectId,
});

module.exports = mongoose.model('Patient', patientSchema);