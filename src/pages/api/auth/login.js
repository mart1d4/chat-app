import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

connectDB();

export default async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user)
            return res
                .status(404)
                .send({ message: "User with that username does not exist" });

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
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    description: user.description,
                    customStatus: user.customStatus,
                    status: user.status,
                    createdAt: user.createdAt,
                },
            });
        } else {
            res.status(401).send({ message: "Incorrect password" });
        }
    } catch (error) {
        console.error("error:" + error);
        res.status(500).send({ message: "Internal server error" });
    }
};
