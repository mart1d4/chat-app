import User from "../../models/User";
import Conversation from "../../models/Conversation";

const removeFriend = async (userID, friendID) => {
    if (!userID) return "No user ID provided";
    if (!friendID) return "No friend ID provided";

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    const conversation = await Conversation.findOne({
        members: { $all: [userID, friendID] },
    });

    // If conversation empty, delete it
    if (conversation) {
        if (conversation.messages?.length === 0) {
            await Conversation.findByIdAndDelete(conversation._id);
        }
    }

    if (!user) return "No user found";
    if (!friend) return "No friend found";

    user.friends = user.friends.filter((id) => id.toString() !== friendID);
    friend.friends = friend.friends.filter((id) => id.toString() !== userID);

    await user.save();
    await friend.save();

    return "Friend removed";
};

export default removeFriend;
