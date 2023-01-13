import User from "../../models/User";

const addFriend = async (userID, friendID) => {
    if (!userID) return { error: "No user ID provided" }
    if (!friendID) return { error: "No friend ID provided" }

    if (userID === friendID) return { error: "Cannot add yourself as a friend" };

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user) return { error: "No user found" }
    if (!friend) return { error: "No friend found" }

    if (user.friends.includes(friendID)) return { error: "Already friends" };
    if (user.friendRequests.sent.includes(friendID))
        return { error: "Already sent friend request" };
    if (user.friendRequests.received.includes(friendID))
        return { error: "Already received friend request" };

    user.friendRequests.sent.push(friendID);
    friend.friendRequests.received.push(userID);

    await user.save();
    await friend.save();

    return friend;
};

export default addFriend;
