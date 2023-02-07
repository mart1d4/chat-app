import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";
import cleanUser from "../../../utils/cleanUser";
import { SignJWT } from "jose";

connectDB();

export default async (req, res) => {
    const cookies = req.cookies;
    if (!cookies.jwt) {
        return res.json({ error: "Unauthorized" });
    }
    const refreshToken = cookies.jwt;

    const user = await User.findOne({ refreshToken });
    if (!user) {
        return res.json({ error: "Forbidden" });
    }

    const accessToken = await new SignJWT(
        cleanUser(user)
    )
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));

    if (!accessToken) {
        return res.json({ error: "Forbidden" });
    }

    return res.json({
        accessToken,
        user: cleanUser(user),
    });
};
