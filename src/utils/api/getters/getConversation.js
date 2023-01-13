import Conversation from "../../models/Conversation";
import mongoose from "mongoose";

const getConversation = async (conversationID) => {
    if (!conversationID) return "No conversation ID provided";

    const conversation = await Conversation.findOne({
        _id: mongoose.Types.ObjectId(conversationID),
    })
        .populate("members")
        .populate("messages")
        .populate({
            path: "messages",
            populate: {
                path: "sender",
                model: "User",
            },
        });

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

    // Do the same for the message sender
    conversation.messages = conversation.messages.map((message) => {
        return {
            ...message,
            sender: {
                _id: message.sender._id,
                username: message.sender.username,
                avatar: message.sender.avatar,
                status: message.sender.status,
                customStatus: message.sender.customStatus,
                description: message.sender.description,
                createdAt: message.sender.createdAt,
            },
        };
    });

    return conversation;
};

export default getConversation;
