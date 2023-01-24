import User from "../../models/User";

const getFriendRequests = async (userID) => {
    if (!userID) return { error: "No user ID provided" };

    const user = await User.findById(userID).populate({
        path: "friendRequests.user",
    });
    if (!user) return { error: "No user found" };

    // Clean the users so there's no sensitive data being sent
    const cleanRequests = user.friendRequests.map((request) => {
        const cleanRequest = {
            _id: request.user._id,
            username: request.user.username,
            avatar: request.user.avatar,
            description: request.user.description,
            customStatus: request.user.customStatus,
            status: request.user.status,
            createdAt: request.user.createdAt,
            type: request.type,
        };
        return cleanRequest;
    });

    return cleanRequests;
};

export default getFriendRequests;
