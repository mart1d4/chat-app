import mongoose from "mongoose";
import connectDB from "../../../../../utils/connectDB";
import Channel from "../../../../../utils/models/Channel";
import Message from "../../../../../utils/models/Message";

connectDB();

export default async (req, res) => {
    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    const { channelID } = req.query;
    const { messageID } = req.query;

    if (!mongoose.Types.ObjectId.isValid(channelID)) {
        return res.status(400).json({ error: "Invalid channel ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageID)) {
        return res.status(400).json({ error: "Invalid message ID" });
    }

    const channel = await Channel.findById(channelID);
    const message = await Message.findById(messageID).populate("author");

    if (!channel) {
        return res.status(404).json({
            success: false,
            message: "Channel not found",
        });
    }

    if (!message) {
        return res.status(404).json({
            success: false,
            message: "Message not found",
        });
    }

    const pins = channel.pinnedMessages;

    if (req.method === "PUT") {
        if (pins.includes(messageID)) {
            return res.status(200).json({
                success: false,
                message: "Message already pinned",
            });
        } else if (pins.length >= 50) {
            return res.status(200).json({
                success: false,
                message: "Channel already has 50 pins",
            });
        } else {
            channel.pinnedMessages.push(messageID);
            await channel.save();

            message.pinned = true;
            await message.save();

            return res.status(200).json({
                success: true,
                message: "Message pinned",
                data: message,
            });
        }
    } else if (req.method === "DELETE") {
        if (pins.includes(messageID)) {
            channel.pinnedMessages.pull(messageID);
            await channel.save();

            message.pinned = false;
            await message.save();

            return res.status(200).json({
                success: true,
                message: "Message unpinned",
                data: message,
            });
        } else {
            return res.status(200).json({
                success: false,
                message: "Message not pinned",
            });
        }
    } else {
        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    }
};
