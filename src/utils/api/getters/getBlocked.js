import User from "../../models/User";

const getBlocked = async (userID) => {
    if (!userID) return "No user ID provided";

    const user = await User.findById(userID).populate("blockedUsers");

    if (!user) return "No user found";

    // Clean the users so there's no sensitive data
    const cleanBlocked = user.blockedUsers.map((blocked) => {
        const blockedObj = blocked.toObject();
        const cleanBlocked = {
            _id: blockedObj._id,
            username: blockedObj.username,
            avatar: blockedObj.avatar,
            status: blockedObj.status,
            customStatus: blockedObj.customStatus,
            description: blockedObj.description,
            createdAt: blockedObj.createdAt,
        };
        return cleanBlocked;
    });

    return cleanBlocked;
};

export default getBlocked;
