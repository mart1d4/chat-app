import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

export default async function connectDB() {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
}
