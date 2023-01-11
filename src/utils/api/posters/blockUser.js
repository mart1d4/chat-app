import User from "../../models/User";

const blockUser = async (userID, blockID) => {
    if (!userID) return "No user ID provided";
    if (!blockID) return "No block ID provided";

    const user = await User.findById(userID);
    const block = await User.findById(blockID);

    if (!user) return "No user found";
    if (!block) return "No block found";

    // Check if user already blocked
    if (user.blocked.includes(blockID)) return "User already blocked";

    user.blocked.push(blockID);
    block.blockers.push(userID);

    // Remove friend if they are friends
    if (user.friends.includes(blockID)) {
        user.friends = user.friends.filter((friend) => friend._id !== blockID);
        block.friends = block.friends.filter((friend) => friend._id !== userID);
    }

    // Cancel friend request if they have sent one
    if (
        user.friendRequests.sent.includes(blockID) ||
        user.friendRequests.received.includes(blockID)
    ) {
        user.friendRequests.sent = user.friendRequests.sent.filter(
            (sent) => sent._id !== blockID
        );
        user.friendRequests.received = user.friendRequests.received.filter(
            (received) => received._id !== blockID
        );
        block.friendRequests.received = block.friendRequests.received.filter(
            (received) => received._id !== userID
        );
        block.friendRequests.sent = block.friendRequests.sent.filter(
            (sent) => sent._id !== userID
        );
    }

    await user.save();
    await block.save();

    return "User blocked";
};

export default blockUser;
