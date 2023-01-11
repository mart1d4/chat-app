import User from "../../models/User";

const addFriend = async (userID, friendID) => {
    if (!userID) return "No user ID provided";
    if (!friendID) return "No friend ID provided";

    if (userID === friendID) return "Can't add yourself as a friend";

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user) return "No user found";
    if (!friend) return "No friend found";

    if (user.friends.includes(friendID)) return "Already friends";
    if (user.friendRequests.sent.includes(friendID))
        return "Already sent friend request";
    if (user.friendRequests.received.includes(friendID))
        return "Already received friend request";

    user.friendRequests.sent.push(friendID);
    friend.friendRequests.received.push(userID);

    await user.save();
    await friend.save();

    return "Friend request sent";
};

export default addFriend;
