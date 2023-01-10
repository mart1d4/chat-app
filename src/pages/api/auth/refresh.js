import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";
import jwt from "jsonwebtoken";

connectDB();

export default async (req, res) => {
    const { cookies } = req;
    if (!cookies?.jwt) return res.status(401).json({ error: "Unauthorized" });
    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ error: "Forbidden" });

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || user.username !== decoded.username)
                return res.status(403).json({ error: "Forbidden" });
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        username: decoded.username,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "10d" }
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
        }
    );
};
