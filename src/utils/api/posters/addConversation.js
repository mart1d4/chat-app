import User from "../../models/User";

const addConversation = async (userID, conversationID) => {
    if (!userID) return "No user ID provided";
    if (!conversationID) return "No conversation ID provided";

    const user = await User.findById(userID);
    const conversation = await Conversation.findById(conversationID);

    if (!user) return "No user found";
    if (!conversation) return "No conversation found";

    // Check if user is in conversation
    if (!conversation.members.includes(userID))
        return "User not in conversation";

    // Check if user already has conversation
    if (user.conversations.includes(conversationID))
        return "User already has conversation";

    // Add conversation to user
    user.conversations.push(conversationID);

    await user.save();

    return "Conversation added";
};

export default addConversation;
