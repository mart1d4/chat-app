import Message from "../../models/Message";
import Channel from "../../models/Channel";
import mongoose from "mongoose";

const deletePrivateMessage = async (channelIDUnclean, messageIDUnclean) => {
    if (!channelIDUnclean || !messageIDUnclean) return { error: "Missing required fields" };

    if (
        !mongoose.Types.ObjectId.isValid(channelIDUnclean)
        || !mongoose.Types.ObjectId.isValid(messageIDUnclean)
    ) return { error: "Invalid ID" };

    const channelID = mongoose.Types.ObjectId(channelIDUnclean);
    const messageID = mongoose.Types.ObjectId(messageIDUnclean);

    const channel = await Channel.findById(channelID);
    if (!channel) return { error: "Channel not found" };

    const message = await Message.findById(messageID);
    if (!message) return { error: "Message not found" };

    // Check if the message is in the channel
    if (!channel.messages.includes(messageID)) return { error: "Message not found in channel" };

    // Delete the message
    await Message.findByIdAndDelete(messageID);

    // Remove the message from the channel
    channel.messages = channel.messages.filter((message) => message.toString() !== messageID.toString());
    await channel.save();

    return { message: "Message deleted" };
}

export default deletePrivateMessage;
