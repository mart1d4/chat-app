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

    // Remove the channel from both members
    // Then add it back at the top of the list
    member1.privateChannels = member1.privateChannels.filter((channel) => channel.toString() !== channelID.toString());
    member1.privateChannels.unshift(channelID);
    await member1.save();

    member2.privateChannels = member2.privateChannels.filter((channel) => channel.toString() !== channelID.toString());
    member2.privateChannels.unshift(channelID);
    await member2.save();

    const newMessage = new Message(message);
    await newMessage.save();

    channel.messages.push(newMessage._id);
    await channel.save();

    return {
        succes: "Message sent",
        message: {
            _id: newMessage._id,
            sender: message.sender,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
        },
    };
};

export default sendPrivateMessage;
