import User from "../../models/User";
import Channel from "../../models/Channel";
import mongoose from "mongoose";

const removePrivateChannel = async (channelIDUnclean, userIDUnclean) => {
    if (!channelIDUnclean || !userIDUnclean) return { error: "Missing parameters" };

    if (
        !mongoose.Types.ObjectId.isValid(channelIDUnclean) ||
        !mongoose.Types.ObjectId.isValid(userIDUnclean)
    ) return { error: "Invalid ID" };

    const channelID = mongoose.Types.ObjectId(channelIDUnclean);
    const userID = mongoose.Types.ObjectId(userIDUnclean);

    const user = await User.findById(userID);
    if (!user) return { error: "User not found" };

    const channel = await Channel.findById(channelID);
    if (!channel) return { error: "Channel not found" };

    if (!user.privateChannels.includes(channelID)) {
        return { error: "User doesn't have channel" };
    }

    user.privateChannels = user.privateChannels.filter(
        (channel) => channel !== channelID
    );
    await user.save();

    return { succes: "Channel removed" };
};

export default removePrivateChannel;
