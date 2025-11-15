import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator'
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const userGetAllByAdminController = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id) {
            return res.status(400).json({
                message: 'Unauthorized request'
            });
        };
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const users = await User.find({ });
        if (!users) {
            return res.status(400).json({
                message: 'Users Not Found'
            });
        };
        if (users.length < 1 ) {
            return res.status(400).json({
                message: 'Users Not Found'
            });
        };
        return res.status(200).json({
            success: true,
            message: 'You Can See Users',
            result: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userGetOneByAdminController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: 'Unauthorized request'
            });
        };
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        return res.status(200).json({
            success: true,
            message: 'User Are Here',
            result: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userPasswordChangeByAdminController = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!id) {
            return res.status(400).json({
                message: 'Unauthorized request'
            });
        };
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password is required (min 6 characters)"
            });
        };
        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        const hashedPassword = await bcrypt.hash(password, 11);
        if (!hashedPassword) {
            return res.status(400).json({
                message: 'Something Wrong'
            });
        };
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({
            success: true,
            message: 'Password Change Success',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const userUpdateByAdminController = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role, isVerified, phoneNumber, address, city, zipCode } = req.body;
        if (!id) {
            return res.status(400).json({
                message: 'User Not Found'
            });
        };
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Please Provide A Valid Email'
            });
        };
        const user = await User.findOne({ _id: id });
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
            _id: id
        }, {
            $set: {
                firstName,
                lastName,
                email,
                profilePic: profilePicUrl,
                profilePicId: profilePicId,
                role,
                isVerified,
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

export const getMeByAdminController = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id) {
            return res.status(400).json({
                message: 'Unauthorized request'
            });
        };
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const admin = User.findOne({ _id: _id });
        if (!admin) {
            return res.status(400).json({
                message: 'Admin Not Found'
            });
        };
        if (admin.role !== "admin") {
            return res.status(400).json({
                message: 'Access denied. Not an admin.'
            });
        };
        return res.status(200).json({
            success: true,
            message: 'You are Admin',
            result: admin
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};

export const allAdminsGetByAdminController = async ( req, res ) => {
    try {
        const { _id } = req.user;
        if (!_id) {
            return res.status(400).json({
                message: 'Unauthorized request'
            });
        };
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const admin = await User.findOne({ _id: _id });
        if (!admin) {
            return res.status(400).json({
                message: 'Admin Not Found'
            });
        };
        if (admin.role !== "admin") {
            return res.status(400).json({
                message: 'Access denied. Not an admin.'
            });
        };
        const admins = await User.find({ role: admin.role });
        return res.status(200).json({
            success: true,
            result: admins
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error Occurred'
        });
    };
};