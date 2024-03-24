import mongoose from 'mongoose';


const notificationSchema = new mongoose.Schema({
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


export default mongoose.model('Notification', notificationSchema);