import NewsLetter from "../models/NewsLetter.js";
import validator from 'validator';
import { sendMail } from "../utils/sendMail.js";
import mongoose from "mongoose";

export const getAllNewsLetters = async (req, res) => {
    try {
        const { _id} = req.user;
        if (!_id) {
            return res.status(401).json({
                message: "Unauthorized access. Please log in."
            });
        };
        if (mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(403).json({
                message: "invalid credentials."
            });
        };
        const newsletters = await NewsLetter.find({}).sort({ createdAt: -1 });
        return res.status(200).json(newsletters);
    } catch (error) {
        return res.status(500).json({
            message: "Server error occurred"
        });
    };
};

export const newsletterSubscribeController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required to subscribe to the newsletter."
            });
        };
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address."
            });
        };
        const existing = await NewsLetter.findOne({ email });
        if (existing) {
            return res.status(400).json({
                message: "This email is already subscribed to the newsletter."
            });
        };
        const newSubscription = new NewsLetter({ email });
        await newSubscription.save();
        sendMail(email);
        return res.status(201).json({
            message: "Thank's for subscribed"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error occurred"
        });
    };
};