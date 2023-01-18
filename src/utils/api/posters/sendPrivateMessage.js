import Channel from "../../models/Channel";
import Message from "../../models/Message";
import mongoose from "mongoose";

const sendPrivateMessage = async (channelIDUnclean, message) => {
    if (!channelIDUnclean || !message) return { error: "Missing parameters" };

    if (!mongoose.Types.ObjectId.isValid(channelIDUnclean)) return { error: "Invalid channel ID" };

    const channelID = mongoose.Types.ObjectId(channelIDUnclean);

    const channel = await Channel.findById(channelID).populate("members");
    if (!channel) return { error: "Channel not found" };

    const member1 = channel.members[0];
    const member2 = channel.members[1];

    // Check if one of the members doesn't have this channel in their channel list
    // If so, add it
    if (!member1.privateChannels.map((channel) => channel.toString()).includes(channelID.toString())) {
        member1.privateChannels.push(channelID);
        await member1.save();
    }

    if (!member2.privateChannels.map((channel) => channel.toString()).includes(channelID.toString())) {
        member2.privateChannels.push(channelID);
        await member2.save();
    }

    const newMessage = new Message(message);
    await newMessage.save();

    channel.messages.push(newMessage._id);
    await channel.save();

    return { succes: "Message sent" };
};

export default sendPrivateMessage;
