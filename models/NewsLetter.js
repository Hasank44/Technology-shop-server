import { Schema, model } from 'mongoose';

const newsLetterSchema = new Schema({
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
}, {
    timestamps: true
});

const NewsLetter = model('NewsLetter', newsLetterSchema);
export default NewsLetter;