import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from 'cookie';

connectDB();

export default async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user)
            return res
                .status(404)
                .send(`No user exists with username ${username}`);

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) {
            const accessToken = jwt.sign(
                { username: user.username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1h" }
            );
            const refreshToken = jwt.sign(
                { username: user.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "10d" }
            );

            user.refreshToken = refreshToken;
            await user.save();

            res.setHeader(
                "Set-Cookie",
                serialize("jwt", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "None",
                    maxAge: 1000 * 60 * 60 * 24,
                    path: "/",
                })
            );

            res.json({
                accessToken,
                user: {
                    username: user.username,
                    description: user.description,
                    avatar: user.avatar,
                    status: user.status,
                    customStatus: user.customStatus,
                    createdAt: user.createdAtFormatted,
                    role: user.role,
                    friendRequests: user.friendRequests,
                    friends: user.friends,
                    _id: user._id,
                },
            });
        } else {
            res.status(401).send("Passwords do not match");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error logging in user");
    }
};
