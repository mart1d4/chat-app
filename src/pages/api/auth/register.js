import User from '../../../utils/models/User';
import connectDB from '../../../utils/connectDB';
import bcrypt from 'bcryptjs';

connectDB();

export default async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user) return res.send(`User already exists with username ${username}`);

        const hash = await bcrypt.hash(password, 10);
        await new User({
            username,
            password: hash
        }).save();

        res.json({ message: 'User created successfully' });
    } catch (error) {
        res.send('Error registering new user. Please try again later.');
    }
};
