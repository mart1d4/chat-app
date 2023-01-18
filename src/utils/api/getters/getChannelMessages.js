import Channel from "../../models/Channel";
import mongoose from "mongoose";

const getChannelMessages = async (channelIDUnclean) => {
    if (!channelIDUnclean) return { error: "No channel ID provided" };

    if (!mongoose.Types.ObjectId.isValid(channelIDUnclean))
        return { error: "Invalid channel ID" };

    const channelID = mongoose.Types.ObjectId(channelIDUnclean);

    const channel = await Channel.findById(channelID).populate("messages").populate({
        path: "messages",
        populate: {
            path: "sender",
            model: "User",
        },
    });

    if (!channel) return { error: "No conversation found" };

    console.log(channel);

    // Clean the channel's messages so there's no sensitive data being sent
    const messages = channel.messages.map((message) => {
        return {
            _id: message._id,
            sender: {
                _id: message.sender._id,
                username: message.sender.username,
                avatar: message.sender.avatar,
                description: message.sender.description,
                status: message.sender.status,
                customStatus: message.sender.customStatus,
                createdAt: message.sender.createdAt,
            },
            content: message.content,
            createdAt: message.createdAt,
        };
    });

    return { messages };
};

export default getChannelMessages;
