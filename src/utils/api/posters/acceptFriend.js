import User from "../../models/User";
import Conversation from "../../models/Conversation";
import mongoose from "mongoose";

const acceptFriend = async (userID, friendID) => {
    if (!userID) return "No user ID provided";
    if (!friendID) return "No friend ID provided";

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user) return "No user found";
    if (!friend) return "No friend found";

    if (!user.friendRequests.received.includes(mongoose.Types.ObjectId(friendID)))
        return "No friend request found";

    if (user.friends.includes(mongoose.Types.ObjectId(friendID)))
        return "Already friends";

    user.friends.push(friendID);
    user.friendRequests.received = user.friendRequests.received.filter(
        (id) => id.toString() !== friendID
    );

    friend.friends.push(userID);
    friend.friendRequests.sent = friend.friendRequests.sent.filter(
        (id) => id.toString() !== userID
    );

    // Create conversation and add it to both users if it doesn't exist
    const conversation = await Conversation.findOne({
        members: { $all: [userID, friendID] },
    });

    if (!conversation) {
        const newConversation = new Conversation({
            members: [userID, friendID],
        });
        await newConversation.save();

        user.conversations.push(newConversation._id);
        friend.conversations.push(newConversation._id);
    } else {
        user.conversations.push(conversation._id);
        friend.conversations.push(conversation._id);
    }

    await user.save();
    await friend.save();

    return "Friend request accepted";
};

export default acceptFriend;
