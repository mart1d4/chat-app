import connectDB from "../../../../utils/connectDB";
import User from "../../../../utils/models/User";
import cleanUser from "../../../../utils/cleanUser";
import mongoose from "mongoose";

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
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const {
            username,
            avatar,
            banner,
            description,
            customStatus,
        } = req.body;

        if (username) {
            user.username = username;
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
        return res.status(400).json({ success: false, message: "Invalid request method." });
    }
}
