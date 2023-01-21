import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
    } catch (err) {
        console.error(err);
    }
};

module.exports = connectDB;
