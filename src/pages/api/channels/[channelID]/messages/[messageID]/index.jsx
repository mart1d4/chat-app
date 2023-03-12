import Channel from "../../../../../../utils/models/Channel";
import Message from "../../../../../../utils/models/Message";
import mongoose from "mongoose";
import connectDB from "../../../../../../utils/connectDB";

connectDB();

export default async (req, res) => {
    const channelID = req.query.channelID;
    const messageID = req.query.messageID;

    console.log(channelID);
    console.log(messageID);

    if (!mongoose.Types.ObjectId.isValid(channelID)) {
        return res.status(400).json({
            success: false,
            message: "Invalid channel ID."
        });
    }

    if (!mongoose.Types.ObjectId.isValid(messageID)) {
        return res.status(400).json({
            success: false,
            message: "Invalid message ID."
        });
    }

    const channel = await Channel.findById(channelID);
    const message = await Message.findById(messageID);

    if (!channel) {
        return res.status(404).json({
            success: false,
            message: "Channel not found."
        });
    }

    if (!message) {
        return res.status(404).json({
            success: false,
            message: "Message not found."
        });
    }

    if (req.method === "PATCH") {
        const content = req.body.content;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Content is required."
            });
        }

        message.content = content;
        message.edited = true;
        await message.save();

        res.status(200).json({
            success: true,
            message
        });
    } else if (req.method === "DELETE") {
        await message.remove();

        res.status(200).json({
            success: true,
            message,
        });
    } else {
        res.status(400).json({
            success: false,
            message: "Invalid request method."
        });
    }
}
