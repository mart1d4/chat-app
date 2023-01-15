import User from "../../models/User";
import mongoose from "mongoose";

const acceptFriendRequest = async (userIDUnclean, friendIDUnclean) => {
    if (!userIDUnclean || !friendIDUnclean) return { error: "Missing parameters" };

    if (userIDUnclean === friendIDUnclean) return { error: "You can't be friends with yourself" };

    if (
        !mongoose.Types.ObjectId.isValid(userIDUnclean) ||
        !mongoose.Types.ObjectId.isValid(friendIDUnclean)
    ) return { error: "Invalid ID" };

    const userID = mongoose.Types.ObjectId(userIDUnclean);
    const friendID = mongoose.Types.ObjectId(friendIDUnclean);

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user || !friend) return { error: "User not found" };

    if (user.friends.includes(friendID)) return { error: "You are already friends" };

    const requestReceived = user.friendRequests.filter((request) => request.type === "received");

    if (
        !requestReceived.map((request) => request.user.toString()).includes(friendID.toString())
    ) return { error: "You have not received a friend request from this user" };

    // Accept friend request
    user.friendRequests = user.friendRequests.filter((request) => request.user.toString() !== friendID.toString());
    friend.friendRequests = friend.friendRequests.filter((request) => request.user.toString() !== userID.toString());

    user.friends.push(friendID);
    friend.friends.push(userID);

    await user.save();
    await friend.save();

    return {
        success: "Friend request accepted",
        user: {
            _id: friend._id,
            username: friend.username,
            avatar: friend.avatar,
            description: friend.description,
            customStatus: friend.customStatus,
            status: friend.status,
            createdAt: friend.createdAt,
        },
    };
};

export default acceptFriendRequest;
