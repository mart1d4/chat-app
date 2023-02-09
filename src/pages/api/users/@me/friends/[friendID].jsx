import User from "../../../../../utils/models/User";
import mongoose from "mongoose";
import connectDB from "../../../../../utils/connectDB";
import cleanUser from "../../../../../utils/cleanUser";
import axios from "../../../../../../src/api/axios";

connectDB();

export default async (req, res) => {
    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    const { friendID } = req.query;
    const { method } = req;

    const user = await User.findById(userJson._id);

    if (friendID === userJson._id) {
        return res.json({ success: false, message: "You can't add yourself as a friend" });
    }

    if (!mongoose.Types.ObjectId.isValid(friendID)) {
        return res.json({ success: false, message: "Invalid user ID" });
    }

    const friend = await User.findById(friendID);

    if (!friend) {
        return res.json({ success: false, message: "User not found" });
    }

    if (method === "POST") {
        const isFriend = user.friends.find(
            (friend) => friend.toString() === friendID
        );

        const isBlocked = user.blocked.find(
            (blocked) => blocked.toString() === friendID
        );

        const isBlockedBy = friend.blocked.find(
            (blocked) => blocked.toString() === user._id.toString()
        );

        const request = user.requests.find(
            (request) => request.user.toString() === friendID
        );

        if (isFriend) {
            return res.json({
                success: false,
                message: "You are already friends with this user"
            });
        } else if (isBlocked) {
            return res.json({
                success: false,
                message: "You have blocked this user"
            });
        } else if (isBlockedBy) {
            return res.json({
                success: false,
                message: "You have been blocked by this user"
            });
        } else if (request && request.type === 1) {
            user.requests = user.requests.filter(
                (request) => request.user.toString() !== friendID
            );
            user.friends.push(friendID);

            friend.requests = friend.requests.filter(
                (request) => request.user.toString() !== user._id.toString()
            );
            friend.friends.push(user._id);

            await user.save();
            await friend.save();

            const response = await axios.post(
                `/users/@me/channels`,
                {
                    recipients: [friend._id],
                },
                {
                    headers: {
                        authorization: req.headers.authorization,
                    },
                }
            );

            const { data } = response;
            let channel;

            if (!data.success) {
                return res.json(data);
            } else {
                channel = data.channel;
            }

            return res.status(200).json({
                success: true,
                message: "Friend request accepted",
                friend: cleanUser(friend),
                channel,
            });
        } else if (request && request.type === 0) {
            return res.json({
                success: false,
                message: "You already sent a friend request to this user"
            });
        } else {
            user.requests.push({ user: friendID, type: 0 });
            friend.requests.push({ user: user._id, type: 1 });

            await user.save();
            await friend.save();

            return res.status(200).json({
                success: true,
                message: "Friend request sent",
                request: {
                    type: 0,
                    user: cleanUser(friend),
                },
            });
        }
    } else if (method === "DELETE") {
        let message;

        if (user.friends.find((friend) => friend.toString() === friendID)) {
            message = "Friend removed";
        } else if (user.requests.find((request) => request.user.toString() === friendID)) {
            message = "Request cancelled";
        } else {
            return res.json({
                success: false,
                message: "You are not friends with this user"
            });
        }

        user.requests = user.requests.filter(
            (request) => request.user.toString() !== friendID.toString()
        );
        user.friends = user.friends.filter(
            (friend) => friend.toString() !== friendID.toString()
        );

        friend.requests = friend.requests.filter(
            (request) => request.user.toString() !== user._id.toString()
        );
        friend.friends = friend.friends.filter(
            (friend) => friend.toString() !== user._id.toString()
        );

        await user.save();
        await friend.save();

        return res.status(200).json({ success: true, message });
    } else {
        return res.status(400).json({ success: false, message: "Invalid method" });
    }
}
