import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


export interface IUser {
    email: string,
    password: string,
    createdAt: Date,
}

const userSchema = new mongoose.Schema<IUser>({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
});

userSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


export default mongoose.model<IUser>('User', userSchema);