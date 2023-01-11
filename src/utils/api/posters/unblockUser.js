import User from "../../models/User";

const unblockUser = async (userID, blockedUserID) => {
    if (!userID) return "No user ID provided";
    if (!blockedUserID) return "No unblock ID provided";

    const user = await User.findById(userID);
    const blockedUser = await User.findById(blockedUserID);

    if (!user) return "No user found";
    if (!blockedUser) return "No blocked user found";

    // Check if user already blocked
    if (!user.blocked.includes(blockedUserID)) return "User not blocked";

    user.blocked = user.blocked.filter(
        (blocked) => blocked._id !== blockedUserID
    );
    blockedUser.blockers = blockedUser.blockers.filter(
        (blocker) => blocker._id !== userID
    );

    await user.save();
    await blockedUser.save();

    return "User unblocked";
};

export default unblockUser;
