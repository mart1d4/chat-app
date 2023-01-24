import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";
import jwt from "jsonwebtoken";

connectDB();

export default async (req, res) => {
    const { cookies } = req;
    if (!cookies?.jwt) {
        res.status(401).json({ error: "Unauthorized" });
        return res.redirect("/login");
    }
    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.status(403).json({ error: "Forbidden" });
        return res.redirect("/login");
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || user.username !== decoded.username) {
            res.status(403).json({ error: "Forbidden" });
            return res.redirect("/login");
        }
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: decoded.username,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
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
    });
};
