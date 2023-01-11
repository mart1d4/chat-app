import User from "../../models/User";
import Conversation from "../../models/Conversation";

const removeConversation = async (userID, conversationID) => {
    if (!userID) return "No user ID provided";
    if (!conversationID) return "No conversation ID provided";

    const user = await User.findById(userID);
    const conversation = await Conversation.findById(conversationID);

    if (!user) return "No user found";
    if (!conversation) return "No conversation found";

    // Check if user is in conversation
    if (!conversation.members.includes(userID))
        return "User not in conversation";

    // Remove conversation from user
    user.conversations = user.conversations.filter(
        (conversation) => conversation._id !== conversationID
    );

    await user.save();

    return "Conversation removed";
};

export default removeConversation;
