import User from "../../models/User";
import mongoose from "mongoose";

const blockUser = async (userIDUnclean, blockedUserIDUnclean) => {
    if (!userIDUnclean || !blockedUserIDUnclean) return { error: "Missing parameters" };

    if (userIDUnclean === blockedUserIDUnclean) return { error: "You can't block yourself" };

    if (
        !mongoose.Types.ObjectId.isValid(userIDUnclean) ||
        !mongoose.Types.ObjectId.isValid(blockedUserIDUnclean)
    ) return { error: "Invalid user ID" };

    const userID = mongoose.Types.ObjectId(userIDUnclean);
    const blockedUserID = mongoose.Types.ObjectId(blockedUserIDUnclean);

    const user = await User.findById(userID);
    const blockedUser = await User.findById(blockedUserID);

    if (!user || !blockedUser) return { error: "User not found" };

    if (user.blockedUsers.includes(blockedUserID)) return { error: "You have already blocked this user" };

    // Block user
    user.blockedUsers.push(blockedUserID);

    // Remove friend if they are friends
    if (user.friends.map((friend) => friend.toString()).includes(blockedUserID.toString())) {
        user.friends = user.friends.filter((friend) => friend.toString() !== blockedUserID.toString());
        blockedUser.friends = blockedUser.friends.filter((friend) => friend.toString() !== userID.toString());
    }

    // Remove friend request if they have sent one or received one
    if (
        user.friendRequests.map((request) => request.user.toString()).includes(blockedUserID.toString())
    ) {
        user.friendRequests = user.friendRequests.filter((request) => request.user.toString() !== blockedUserID.toString());
        blockedUser.friendRequests = blockedUser.friendRequests.filter((request) => request.user.toString() !== userID.toString());
    }

    await user.save();
    await blockedUser.save();

    return {
        success: "User blocked",
        user: {
            _id: blockedUser._id,
            username: blockedUser.username,
            avatar: blockedUser.avatar,
        },
    };
};

export default blockUser;
