import Channel from "../../models/Channel";
import Message from "../../models/Message";
import mongoose from "mongoose";

const editPrivateMessage = async (channelIDUnclean, messageIDUnclean, newMessage) => {
    if (!channelIDUnclean || !messageIDUnclean || !newMessage) {
        return { error: "Missing parameters" };
    }

    if (
        !mongoose.Types.ObjectId.isValid(channelIDUnclean) ||
        !mongoose.Types.ObjectId.isValid(messageIDUnclean)
    ) {
        return { error: "Invalid ID" };
    }

    const channelID = mongoose.Types.ObjectId(channelIDUnclean);
    const messageID = mongoose.Types.ObjectId(messageIDUnclean);

    const channel = await Channel.findById(channelID);
    if (!channel) return { error: "Channel not found" };

    const message = await Message.findById(messageID);
    if (!message) return { error: "Message not found" };

    if (!channel.messages.includes(messageID)) {
        return { error: "Channel doesn't have message" };
    }

    message.content = newMessage;
    message.edited = true;

    await message.save();

    return { succes: "Message edited" };
};

export default editPrivateMessage;
