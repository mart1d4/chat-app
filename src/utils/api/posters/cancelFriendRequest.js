import User from "../../models/User";
import mongoose from "mongoose";

const cancelFriendRequest = async (userIDUnclean, friendIDUnclean) => {
    if (!userIDUnclean || !friendIDUnclean) return { error: "Missing parameters" };

    if (userIDUnclean === friendIDUnclean) return { error: "You can't be friends with yourself" };

    if (
        !mongoose.Types.ObjectId.isValid(userIDUnclean) ||
        !mongoose.Types.ObjectId.isValid(friendIDUnclean)
    ) return { error: "Invalid user ID" };

    const userID = mongoose.Types.ObjectId(userIDUnclean);
    const friendID = mongoose.Types.ObjectId(friendIDUnclean);

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user || !friend) return { error: "User not found" };

    // Check if the user has sent a friend request to the friend
    const requestSent = user.friendRequests.filter((request) => request.type === "sent");
    if (
        !requestSent || !requestSent.map((request) => request.user.toString()).includes(friendID.toString())
    ) return { error: "You have not sent a friend request to this user" };

    // Cancel friend request
    user.friendRequests = user.friendRequests.filter((request) => request.user.toString() !== friendID.toString());
    friend.friendRequests = friend.friendRequests.filter((request) => request.user.toString() !== userID.toString());

    await user.save();
    await friend.save();

    return { success: "Friend request cancelled" };
};

export default cancelFriendRequest;
