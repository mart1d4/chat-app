import connectDB from "../../../../utils/connectDB";
import User from "../../../../utils/models/User";
import cleanUser from "../../../../utils/cleanUser";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { serialize } from "cookie";

connectDB();

export default async (req, res) => {
    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    if (req.method === "GET") {
        return res.json({
            success: true,
            user: userJson,
        });
    } else if (req.method === "PATCH") {
        const userID = userJson._id;

        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const user = await User.findById(userID);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        const {
            password,
            newPassword,
            username,
            avatar,
            banner,
            description,
            customStatus,
        } = req.body;

        if (!password) {
            return res.json({
                success: false,
                message: "Password is required."
            });
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            res.json({
                success: false,
                message: "Incorrect password",
            });
        }

        if (newPassword) {
            if (newPassword.length < 8) {
                return res.json({
                    success: false,
                    message: "Password must be at least 8 characters long."
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;

            const accessToken = await new SignJWT(cleanUser(user))
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("1d")
                .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));

            const refreshToken = await new SignJWT(cleanUser(user))
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("10d")
                .sign(new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET));

            user.refreshToken = refreshToken;
            await user.save();

            res.setHeader(
                "Set-Cookie",
                serialize("jwt", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "None",
                    maxAge: 1000 * 120,
                    path: "/",
                })
            );

            return res.json({
                success: true,
                accessToken,
                user: cleanUser(user),
            });
        }

        if (username) {
            if (username.length < 3) {
                return res.json({
                    success: false,
                    message: "Username must be at least 3 characters long."
                });
            } else if (username.length > 32) {
                return res.json({
                    success: false,
                    message: "Username must be at most 20 characters long."
                });
            }

            const sameUsername = await User.findOne({ username });
            if (sameUsername && sameUsername._id.toString() !== user._id.toString()) {
                return res.json({
                    success: false,
                    message: "Username already taken."
                });
            } else {
                user.username = username;
            }
        }

        if (avatar) {
            user.avatar = avatar;
        }

        if (banner) {
            user.banner = banner;
        }

        if (description) {
            user.description = description;
        }

        if (customStatus) {
            user.customStatus = customStatus;
        }

        await user.save();

        return res.json({
            success: true,
            user: cleanUser(user),
        });
    } else {
        return res.json({
            success: false,
            message: "Invalid request method."
        });
    }
}
