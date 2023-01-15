import User from "../../models/User";
import mongoose from "mongoose";

const removeFriend = async (userIDUnclean, friendIDUnclean) => {
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

    if (!user.friends.includes(friendID)) return { error: "You are not friends with this user" };

    // Remove friend
    user.friends = user.friends.filter((friend) => friend.toString() !== friendID.toString());
    friend.friends = friend.friends.filter((friend) => friend.toString() !== userID.toString());

    await user.save();
    await friend.save();

    return { success: "Friend removed" };
};

export default removeFriend;
