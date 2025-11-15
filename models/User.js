import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
    },
    profilePic: {
        type: String,
        default: "",
        trim: true
    },
    profilePicId: {
        type: String,
        trim: true,
        default: "",
    },
    role: {
        type: String,
        trim: true,
        default: "user"
    },
    token: {
        type: String,
        trim: true,
        default: null
    },
    isVerified: {
        type: Boolean,
        trim: true,
        default: false
    },
    isLoggedIn: {
        type: Boolean,
        trim: true,
        default: false
    },
    otp: {
        type: String,
        trim: true,
        default: false
    },
    otpExpire: {
        type: Date,
        trim: true,
        default: null
    },
    otpVerified: {
        type: Boolean,
        trim: true,
        default: false
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: ""
    },
    address: {
        type: String,
        trim: true,
        default: ""
    },
    city: {
        type: String,
        trim: true,
        default: ""
    },
    zipCode: {
        type: String,
        trim: true,
        default: ""
    },

}, {
    timestamps: true
});

const User = model('User', userSchema);
export default User;