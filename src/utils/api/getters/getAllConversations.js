import Conversation from "../../models/Conversation";
import mongoose from "mongoose";

const getAllConversations = async (userID) => {
    if (!userID) return ("No user ID provided");

    const conversations = await Conversation.find({
        members: { $in: [mongoose.Types.ObjectId(userID)] },
    }).populate("members");

    if (!conversations) return ("No conversations found");

    // Clean the conversation so the own user data is not sent
    const conversationWithoutUser = conversations.map((conversation) => {
        const cleanConversation = {
            _id: conversation._id,
            members: conversation.members.filter(
                (member) => member._id.toString() !== userID
            ),
            messages: conversation.messages,
        };
        return cleanConversation;
    });

    // Clean the conversation so no sensitive user data is being sent
    const cleanConversations = conversationWithoutUser.map(conversation => {
        conversation.members = conversation.members.map(member => {
            return  {
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
    });


    return cleanConversations;
};

export default getAllConversations;
