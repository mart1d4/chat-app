import User from "../../models/User";

const getRequestsSent = async (userID) => {
    if (!userID) return "No user ID provided";

    const user = await User.findById(userID).populate("friendRequests.sent");

    if (!user) return "No user found";

    // Clean the users so there's no sensitive data
    const cleanRequests = user.friendRequests.sent.map((request) => {
        const requestObj = request.toObject();
        const cleanRequest = {
            _id: requestObj._id,
            username: requestObj.username,
            avatar: requestObj.avatar,
            status: requestObj.status,
            customStatus: requestObj.customStatus,
            description: requestObj.description,
            createdAt: requestObj.createdAt,
        };
        return cleanRequest;
    });

    return cleanRequests;
};

export default getRequestsSent;
