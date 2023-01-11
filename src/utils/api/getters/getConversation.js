import Conversation from "../../models/Conversation";
import mongoose from "mongoose";

const getConversation = async (conversationID) => {
    if (!conversationID) return "No conversation ID provided";

    const conversation = await Conversation.findOne({
        _id: mongoose.Types.ObjectId(conversationID),
    }).populate("members").populate("messages");

    if (!conversation) return "No conversation found";

    // Clean the conversation so no sensitive user data is being sent
    conversation.members = conversation.members.filter((member) => {
        return {
            _id: member._id,
            username: member.username,
            avatar: member.avatar,
            status: member.status,
            customStatus: member.customStatus,
            description: member.description,
            createdAt: member.createdAt,
        };
    });

    return conversation;
};

export default getConversation;
