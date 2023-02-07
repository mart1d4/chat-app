import connectDB from "../../../utils/connectDB";
import User from "../../../utils/models/User";
import cleanUser from "../../../utils/cleanUser";
import mongoose from "mongoose";

connectDB();

export default async (req, res) => {
    const { userID } = req.query;

    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    if (
        req.method !== "GET" &&
        req.method !== "DELETE" &&
        req.method !== "POST"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid request method."
        });
    }

    if (req.method === "DELETE") {
        if (
            !mongoose.Types.ObjectId.isValid(userID) ||
            !mongoose.Types.ObjectId.isValid(userJson._id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const user = await User.findById(userJson._id);
        const friend = await User.findById(userID);

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isBlocked = user.blocked.find(
            (blocked) => blocked.toString() === userID
        );

        if (isBlocked) {
            return res.json({
                success: false,
                message: "You have already blocked this user."
            });
        }

        user.friends = user.friends.filter(
            (friend) => friend.toString() !== userID
        );

        friend.friends = friend.friends.filter(
            (friend) => friend.toString() !== user._id.toString()
        );

        user.requests = user.requests.filter(
            (request) => request.user.toString() !== userID
        );

        friend.requests = friend.requests.filter(
            (request) => request.user.toString() !== user._id.toString()
        );

        user.blocked.push(userID);

        await user.save();
        await friend.save();

        return res.json({
            success: true,
            message: "You have successfully blocked this user.",
            blocked: cleanUser(friend),
        });

    } else if (req.method === "POST") {
        // Unblock user if blocked
        if (
            !mongoose.Types.ObjectId.isValid(userID) ||
            !mongoose.Types.ObjectId.isValid(userJson._id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const user = await User.findById(userJson._id);
        const friend = await User.findById(userID);

        if (!user || !friend) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isBlocked = user.blocked.find(
            (blocked) => blocked.toString() === userID
        );

        if (!isBlocked) {
            return res.json({
                success: false,
                message: "You have not blocked this user."
            });
        } else {
            user.blocked = user.blocked.filter(
                (blocked) => blocked.toString() !== userID
            );

            await user.save();

            return res.json({
                success: true,
                message: "You have successfully unblocked this user.",
                unblocked: cleanUser(friend),
            });
        }
    } else {
        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        } else {
            const user = await User.findById(userID);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            } else {
                return res.json({
                    success: true,
                    user: cleanUser(user),
                });
            }
        }
    }
};
