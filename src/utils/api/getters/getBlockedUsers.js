import User from "../../models/User";
import mongoose from "mongoose";

const getBlockedUsers = async (userIDUnclean) => {
    if (!userIDUnclean) return { error: "No user ID provided" };

    if (!mongoose.Types.ObjectId.isValid(userIDUnclean)) return { error: "Invalid user ID" };

    const userID = mongoose.Types.ObjectId(userIDUnclean);

    const user = await User.findById(userID).populate("blockedUsers");
    if (!user) return { error: "No user found" };

    // Clean the users so there's no sensitive data being sent
    const cleanBlockedUsers = user.blockedUsers.map((user) => {
        const cleanUser = {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            description: user.description,
            customStatus: user.customStatus,
            status: user.status,
            createdAt: user.createdAt,
        };
        return cleanUser;
    });

    return cleanBlockedUsers;
};

export default getBlockedUsers;
