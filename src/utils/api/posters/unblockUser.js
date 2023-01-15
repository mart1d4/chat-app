import User from "../../models/User";
import mongoose from "mongoose";

const unblockUser = async (userIDUnclean, blockedUserIDUnclean) => {
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

    if (
        !user.blockedUsers.map(
            (blockedUser) => blockedUser.toString()).includes(blockedUserID.toString()
            )
    ) return { error: "You have not blocked this user" };

    // Unblock user
    user.blockedUsers = user.blockedUsers.filter((blockedUser) => blockedUser.toString() !== blockedUserID.toString());

    await user.save();

    return { success: "User unblocked" };
};

export default unblockUser;
