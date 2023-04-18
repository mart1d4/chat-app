import Channel from "../../../../../../utils/models/Channel";
import Message from "../../../../../../utils/models/Message";
import mongoose from "mongoose";
import connectDB from "../../../../../../utils/connectDB";

connectDB();

export default async (req, res) => {
    const channelID = req.query.channelID;
    const messageID = req.query.messageID;

    if (!mongoose.Types.ObjectId.isValid(channelID)) {
        return res.status(400).json({
            success: false,
            message: "Invalid channel ID."
        });
    };

    if (!mongoose.Types.ObjectId.isValid(messageID)) {
        return res.status(400).json({
            success: false,
            message: "Invalid message ID."
        });
    };

    const channel = await Channel.findById(channelID).populate("pinnedMessages");
    const message = await Message.findById(messageID).populate("messageReference").populate("author").populate({
        path: "messageReference",
        populate: {
            path: "author",
            model: "User",
        },
    });

    const messageRef = await Message.findById(message?.messageReference);

    if (!channel) {
        return res.status(404).json({
            success: false,
            message: "Channel not found."
        });
    };

    if (!message) {
        return res.status(404).json({
            success: false,
            message: "Message not found."
        });
    };

    if (req.method === "PATCH") {
        if (message.author._id !== req.user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not the author of this message."
            });
        };

        const content = req.body.content;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Content is required."
            });
        };

        message.content = content;
        message.edited = true;
        await message.save();

        res.status(200).json({
            success: true,
            message: {
                ...message._doc,
                messageReference: messageRef ?? null,
            },
        });
    } else if (req.method === "DELETE") {
        if (
            message.author._id !== req.user._id
            && channel.owner._id !== req.user._id
        ) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this message."
            });
        };

        await message.remove();

        if (channel.pinnedMessages.includes(message._id)) {
            channel.pinnedMessages = channel.pinnedMessages.filter((m) => m !== message._id);
            await channel.save();
        };

        res.status(200).json({
            success: true,
            message: {
                ...message._doc,
                messageReference: messageRef ?? null,
            },
        });
    } else {
        res.status(400).json({
            success: false,
            message: "Invalid request method."
        });
    };
}
