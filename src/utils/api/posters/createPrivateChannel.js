import User from "../../models/User";
import Channel from "../../models/Channel";
import mongoose from "mongoose";

const addPrivateChannel = async (userIDUnclean, friendIDUnclean) => {
    if (!userIDUnclean || !friendIDUnclean) return { error: "Missing parameters" };

    if (userIDUnclean === friendIDUnclean) return { error: "You can't create a private channel with yourself" };

    const userID = mongoose.Types.ObjectId(userIDUnclean);
    const friendID = mongoose.Types.ObjectId(friendIDUnclean);

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user || !friend) return { error: "User not found" };

    // Check if the channel already exists
    const channel = await Channel.findOne({
        members: {
            $all: [userID, friendID],
        },
        type: "private",
    });

    if (channel) {
        return {
            success: "Channel already exists",
            channelID: channel._id,
        }
    }

    const newChannel = new Channel({
        members: [userID, friendID],
        type: "private",
    });

    await newChannel.save();

    return {
        success: "Channel created",
        channelID: newChannel._id,
    };
}

export default addPrivateChannel;
