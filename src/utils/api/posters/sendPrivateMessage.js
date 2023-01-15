import Channel from "../../models/Channel";
import Message from "../../models/Message";
import mongoose from "mongoose";

const sendPrivateMessage = async (channelIDUnclean, message) => {
    if (!channelIDUnclean || !message) return { error: "Missing parameters" };

    if (!mongoose.Types.ObjectId.isValid(channelIDUnclean)) return { error: "Invalid channel ID" };

    const channelID = mongoose.Types.ObjectId(channelIDUnclean);

    const channel = await Channel.findById(channelID);
    if (!channel) return { error: "Channel not found" };

    const newMessage = new Message(message);
    await newMessage.save();

    channel.messages.push(newMessage._id);
    await channel.save();

    return { succes: "Message sent" };
};

export default sendPrivateMessage;
