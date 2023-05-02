// @ts-nocheck

import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const connectDB = async (): Promise<void> => {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
    
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
};

export default connectDB;
