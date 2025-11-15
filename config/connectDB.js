import mongoose from 'mongoose';
const db_url = process.env.DB_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(db_url, {});
        console.log('Database Connected');
    } catch (error) {
        console.log('Database Connect Failed')
    };
};

export default connectDB;