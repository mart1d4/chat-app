import { ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const connectDB = async (): Promise<void> => {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
    if (mongoose.connection.readyState >= 1) return;

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
};

export default connectDB;
