import User from "../../models/User";
import mongoose from "mongoose";

const cancelFriend = async (userID, friendID) => {
    if (!userID) return "No user ID provided";
    if (!friendID) return "No friend ID provided";

    if (userID === friendID) return "Can't cancel friend request to yourself";

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user) return "No user found";
    if (!friend) return "No friend found";

    if (!user.friendRequests.sent.includes(mongoose.Types.ObjectId(friendID)))
        return "No friend request sent";
    if (!friend.friendRequests.received.includes(mongoose.Types.ObjectId(userID)))
        return "No friend request received";

    user.friendRequests.sent = user.friendRequests.sent.filter(
        (id) => id.toString() !== friendID
    );
    friend.friendRequests.received = friend.friendRequests.received.filter(
        (id) => id.toString() !== userID
    );

    await user.save();
    await friend.save();

    return "Friend request cancelled";
};

export default cancelFriend;
