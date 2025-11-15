import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import userRegisterValidate from "../validators/userRegisterValidator.js";
import userLoginValidate from "../validators/userLoginValidator.js";
import userChangePasswordValidate from '../validators/changePasswordValidator.js';
import Session from "../models/Session.js";
import { passwordChangedEmail } from "../utils/passwordChanged.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import { verifyEmail } from "../utils/verifyEmail.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";
import { sendPasswordResetSuccessEmail } from "../utils/sendPasswordResetSuccessEmail.js";

const secret = process.env.JWT_SECRET;

export const userGetMeController = async ( req, res ) => {
    try {
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const user = await User.findOne({ _id: _id });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        if (user.isLoggedIn !== true) {
            return res.status(400).json({
                message: 'Please Login Your Account'
            });
        };
        if (user.isVerified !== true) {
            return res.status(400).json({
                message: 'Please Verify Your Account'
            });
        };
        const currentUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isLoggedIn: user.isLoggedIn,
            isVerified: user.isVerified,
            profilePic: user.profilePic,
            profilePicId: user.profilePicId,
            phoneNumber: user.phoneNumber,
            address: user.address,
            city: user.city,
            zipCode: user.zipCode,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            _v: user.__v
        };
        return res.status(200).json({
            success: true,
            message: 'You Can See Your Account',
            result: currentUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userRegisterController = async ( req, res ) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const valid = userRegisterValidate({ firstName, lastName, email, password });
        if (!valid.isValid) {
            return res.status(400).json(valid.error);
        };
        const isExist = await User.findOne({ email });
        if (isExist) {
            return res.status(400).json({
                message: 'Account Already Exist'
            });
        };
        const hashedPassword = await bcrypt.hash(password, 11);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });
        if (!newUser) {
            return res.status(400).json({
                message: 'Unauthorized request'
            });
        };
        const mailerToken = jwt.sign({
            _id: newUser._id
        }, secret, {
            expiresIn: '10m'
        });
        verifyEmail(mailerToken, email);
        newUser.token = mailerToken
        const savedUser = await newUser.save();
        if (!savedUser) {
            return res.status(400).json({
                message: 'Account Create Failed'
            });
        };
        return res.status(201).json({
            success: true,
            message: 'Account Create Success',
            result: savedUser,
            token: mailerToken
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userEmailVerifyController = async ( req, res ) => {
    try {
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const user = await User.findOne({ _id: _id });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        user.token = null;
        user.isVerified = true
        await user.save();
        sendWelcomeEmail(user.email, user.firstName);
        return res.status(200).json({
            success: true,
            message: 'Email Verification Success'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userEmailReVerifyController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: 'Please Provide Your Email'
            });
        };
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Please Provide Your Valid Email'
            });
        };
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        const token = jwt.sign({
            _id: user._id
        }, secret, {
            expiresIn: '10m'
        });
        verifyEmail(token, email);
        user.token = token;
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'Email Sent Again Successfully',
            token: token
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userLoginController = async ( req, res ) => {
    try {
        const { email, password } = req.body;
        const valid = userLoginValidate({ email, password });
        if (!valid.isValid) {
            return res.status(400).json(valid.error);
        };
        const isExist = await User.findOne({ email });
        if (!isExist) {
            return res.status(400).json({
                message: 'User Not Exist'
            });
        };
        const matchPassword = await bcrypt.compare(password, isExist.password);
        if (!matchPassword) {
            return res.status(501).json({
                message: 'Incorrect Password'
            });
        };
        if (isExist.isVerified === false) {
            return res.status(400).json({
                message: 'Please Verify Your Account Then Login'
            });
        };

        // generate token
        const accessToken = jwt.sign({
            _id: isExist._id
        }, secret, {
            expiresIn: '7d'
        });
        const refreshToken = jwt.sign({
            _id: isExist._id
        }, secret, {
            expiresIn: '15d'
        });

        isExist.isLoggedIn = true;
        await isExist.save();
        const isSession = await Session.findOne({ userId: isExist._id });
        if (isSession) {
            await Session.findOneAndDelete({ userId: isExist._id });
        };
        const session = new Session({
            userId: isExist._id
        });
        await session.save();
        const user = {
            _id: isExist._id,
            firstName: isExist.firstName,
            lastName: isExist.lastName,
            email: isExist.email,
            isLoggedIn: isExist.isLoggedIn,
            isVerified: isExist.isVerified,
            profilePic: isExist.profilePic,
            profilePicId: isExist.profilePicId,
            phoneNumber: isExist.phoneNumber,
            address: isExist.address,
            city: isExist.city,
            zipCode: isExist.zipCode,
            createdAt: isExist.createdAt,
            updatedAt: isExist.updatedAt,
            _v: isExist.__v
        };
        return res.status(200).json({
            success: true,
            message: 'Login Success',
            result: user,
            accessToken: `Bearer ${accessToken}`,
            refreshToken: `Bearer ${refreshToken}`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userLogoutController = async ( req, res ) => {
    try {
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        await Session.deleteMany({ userId: _id });

        const logged = await User.findOne({ _id: _id });
        if (logged.isLoggedIn === false) {
        return res.status(400).json({
            message: 'You Are Already Logged Out'
            });
        };
        
        await User.findOneAndUpdate({
            _id: _id
        }, {
            $set: {
                isLoggedIn: false
            }
        }, {
            new: true
        });
        return res.status(200).json({
            success: true,
            message: 'Logout Success'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userPasswordForgetController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: 'Please Provide Your Email'
            });
        };
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Please Provide Your Valid Email'
            });
        };
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        // generate otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); //min
        
        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();
        sendOtpEmail(email, user.firstName, otp);
        return res.status(200).json({
            success: true,
            message: 'Otp Sent to Email Success'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userReSendOtp = async (req, res) => {
   try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({
                message: 'invalid credentials'
            });
        };
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'email not valid'
            });
        };
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'account not found'
            });
       };
       if (user.otp === null) {
           return res.status(400).json({
               message: 'OTP is received'
           });
       };
       if (user.otpExpire === null) {
           return res.status(400).json({
               message: 'OTP is received'
           });
       };
       if (user.otp === false) {
           return res.status(400).json({
               message: 'OTP is received'
           });
       };
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expired = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otpExpire = expired;
        await user.save();
        sendOtpEmail(user.email, user.userName, user.otp);
        return res.status(200).json({
            success: true,
            message: 'Otp re-sent Success'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    }; 
};

export const userOtpVerifyController = async (req, res) => {
    try {
        const { otp } = req.body;
        const { email } = req.params;
        if (!otp) {
            return res.status(400).json({
                message: 'Otp Is Required'
            });
        };
        if (!email === validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Please Provide A Valid Email'
            });
        };
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        if (otp !== user.otp) {
            return res.status(400).json({
                message: 'Otp Is Invalid'
            });
        };
        if (!user.otp || !user.otpExpire) {
            return res.status(400).json({
                message: 'Otp Not Generated or Already Verified'
            });
        };
        if (user.otpExpire < new Date()) {
            return res.status(400).json({
                message: 'Otp Has Expired Please Generate a new otp'
            });
        };
        user.otp = null;
        user.otpExpire = null;
        user.otpVerified = true;
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'Otp Verified Success'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userNewPasswordController = async ( req, res ) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const { email } = req.params;

        const valid = userChangePasswordValidate({ newPassword, confirmPassword });
        if (!valid.isValid) {
            return res.status(400).json(valid.error);
        };
        if (!email) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        if (user.otpVerified !== true) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const hashedPassword = await bcrypt.hash(newPassword, 11);
        user.password = hashedPassword;
        user.otpVerified = false;
        await user.save();
        sendPasswordResetSuccessEmail(user.email, user.firstName);
        return res.status(200).json({
            success: true,
            message: 'Password Reset Success'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userPasswordChangeController = async ( req, res ) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const { _id } = req.user;
        if (!currentPassword) {
            return res.status(400).json({
                message: 'Please Provide Your Current Password'
            });
        };
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const user = await User.findOne({ _id: _id });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        const isLogged = user.isLoggedIn;
        if (isLogged !== true) {
            return res.status().json({
                message: 'Please login first'
            });
        };
        const isVerified = user.isVerified;
        if (isVerified !== true) {
            return res.status().json({
                message: 'Please Verify Your Account'
            });
        };
        const originalPassword = user.password;
        const isMatch = bcrypt.compare(currentPassword, originalPassword);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Incorrect Password'
            });
        };
        const valid = userChangePasswordValidate({ newPassword, confirmPassword });
        if (!valid.isValid) {
            return res.status(400).json(valid.error);
        };
        const hashedPassword = await bcrypt.hash(newPassword, 11);
        user.password = hashedPassword;
        await user.save();
        passwordChangedEmail(user.email, user.firstName);
        return res.status(200).json({
            success: true,
            message: 'Password change Success'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userUpdateController = async (req, res) => {
    try {
        const { _id } = req.user;
        const { firstName, lastName, email, phoneNumber, address, city, zipCode } = req.body;
        if (!_id) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        if (email) {
            if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Please Provide A Valid Email'
            });
        };
        };
        const user = await User.findOne({ _id: _id });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        let profilePicUrl = user.profilePic;
        let profilePicId = user.profilePicId;
        let image = req.file;
        if (image) {
            if (profilePicId) {
                await cloudinary.uploader.destroy(profilePicId);
            };
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({
                    folder: 'Profiles'
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    };
                });
                stream.end(req.file.buffer);
            });
            profilePicUrl = uploadResult.secure_url;
            profilePicId = uploadResult.public_id
        };
        const updated = await User.findOneAndUpdate({
            _id: _id
        }, {
            $set: {
                firstName,
                lastName,
                email,
                profilePic: profilePicUrl,
                profilePicId: profilePicId,
                phoneNumber,
                address,
                city,
                zipCode
            }
        }, {
            new: true
        });
        return res.status(200).json({
            success: true,
            message: 'Update Success',
            result: updated
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};