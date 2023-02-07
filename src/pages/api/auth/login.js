import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";
import cleanUser from "../../../utils/cleanUser";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { serialize } from "cookie";

connectDB();

export default async (req, res) => {
    const { uid, password } = req.body;

    if (!uid || !password) {
        return res.send({
            error: "Login or password is invalid",
            message: "Please provide a valid username and password",
        });
    }

    try {
        const user = await User.findOne({ username: uid });

        if (!user)
            return res.send({
                error: "Login or password is invalid",
                message: "User with that username does not exist",
            });

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) {
            const accessToken = await new SignJWT(
                cleanUser(user)
            )
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("1h")
                .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));

            const refreshToken = await new SignJWT(
                cleanUser(user)
            )
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("1d")
                .sign(new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET));

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
                user: cleanUser(user),
            });
        } else {
            res.send({
                error: "Login or password is invalid",
                message: "Incorrect password",
            });
        }
    } catch (error) {
        res.send({
            error: "Something went wrong",
        });
    }
};
