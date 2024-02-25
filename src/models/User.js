const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: String,
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
});

module.exports = mongoose.model('User', userSchema);