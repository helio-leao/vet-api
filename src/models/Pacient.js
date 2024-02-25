const mongoose = require('mongoose');

const pacientSchema = mongoose.Schema({
    name: String,
    species: String,
    breed: String,
    birthdate: Date,
    tutor: mongoose.SchemaTypes.ObjectId,
});

module.exports = mongoose.model('Pacient', pacientSchema);