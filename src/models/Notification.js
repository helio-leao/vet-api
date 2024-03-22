const mongoose = require('mongoose');


const notificationSchema = mongoose.Schema({
    message: String,
    status: {
        type: String,
        enum: ['UNREAD', 'READ'],
        default: 'UNREAD',
    },
    exam: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Exam',
        required: true,
    },
});


module.exports = mongoose.model('Notification', notificationSchema);