import User from "../../models/User";

const getFriends = async (userID) => {
    if (!userID) return { error: "No user ID provided" }

    const user = await User.findById(userID).populate("friends");
    if (!user) return { error: "No user found" };

    // Clean the users so there's no sensitive data being sent
    const cleanFriends = user.friends.map((friend) => {
        const cleanFriend = {
            _id: friend._id,
            username: friend.username,
            avatar: friend.avatar,
            description: friend.description,
            customStatus: friend.customStatus,
            status: friend.status,
            createdAt: friend.createdAt,
        };
        return cleanFriend;
    });

    return cleanFriends;
};

export default getFriends;
