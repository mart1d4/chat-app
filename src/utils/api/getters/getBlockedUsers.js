import User from "../../models/User";

const getBlockedUsers = async (userID) => {
    if (!userID) return { error: "No user ID provided" };

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
