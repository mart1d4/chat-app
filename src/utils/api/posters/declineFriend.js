import User from "../../models/User";
import mongoose from "mongoose";

const declineFriend = async (userID, friendID) => {
    if (!userID) return "No user ID provided";
    if (!friendID) return "No friend ID provided";

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user) return "No user found";
    if (!friend) return "No friend found";

    if (!user.friendRequests.received.includes(mongoose.Types.ObjectId(friendID)))
        return "No friend request found";

    user.friendRequests.received = user.friendRequests.received.filter(
        (id) => id.toString() !== friendID
    );
    friend.friendRequests.sent = friend.friendRequests.sent.filter(
        (id) => id.toString() !== userID
    );

    await user.save();
    await friend.save();

    return "Friend request declined";
};

export default declineFriend;
