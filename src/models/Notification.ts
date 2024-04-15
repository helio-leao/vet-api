import mongoose from 'mongoose';
import { Types } from 'mongoose';


export interface INotification {
    message: string,
    status: 'UNREAD' | 'READ',
    exam: Types.ObjectId,
}

const notificationSchema = new mongoose.Schema({
    message: String,
    status: {
        type: String,
        enum: ['UNREAD', 'READ'],   // todo: change to a boolean (unread)
        default: 'UNREAD',
    },
    exam: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Exam',
        required: true,
    },
});


export default mongoose.model<INotification>('Notification', notificationSchema);