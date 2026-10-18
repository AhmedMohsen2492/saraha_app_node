import mongoose from 'mongoose';
import { systemRoles } from '../../constants/constants.js';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: [true, 'Username is required'],
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username must be at most 30 characters long'],
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [18, 'Age must be at least 18'],
        max: [100, 'Age must be at most 100'],
    },
    profileImage: String,
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    otp: String,
    otpExpireAt:Date,
    role:{
        type:String,
        default: systemRoles.USER,
        enum: Object.values(systemRoles),
    }
},
    {
        timestamps: true,
    });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;


// import { db } from "../connection.js";

// const userModel = db.collection('users');
// userModel.createIndex({ email: 1 }, { unique: true, name: 'unique_email_index' });


// export default userModel;