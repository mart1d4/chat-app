import User from "../../models/User";

const getFriends = async (userID) => {
    if (!userID) return "No user ID provided";

    const user = await User.findById(userID).populate("friends");

    if (!user) return "No user found";

    // Clean the users so there's no sensitive data
    const cleanFriends = user.friends.map((friend) => {
        const friendObj = friend.toObject();
        const cleanFriend = {
            _id: friendObj._id,
            username: friendObj.username,
            avatar: friendObj.avatar,
            status: friendObj.status,
            customStatus: friendObj.customStatus,
            description: friendObj.description,
            createdAt: friendObj.createdAt,
        };
        return cleanFriend;
    });

    return cleanFriends;
};

export default getFriends;
