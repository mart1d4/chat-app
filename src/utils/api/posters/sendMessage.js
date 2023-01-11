import Conversation from "../../../utils/models/Conversation";
import Message from "../../../utils/models/Message";

const sendMessage = async (conversationID, messageContent) => {
    if (!conversationID) return "No conversation ID provided";
    if (!messageContent) return "No message provided";

    const conversation = await Conversation.findById(conversationID)
        .populate("members")
        .populate("messages");

    console.log(conversation);

    if (!conversation) return "No conversation found";

    // Check if a participant removed the conversation
    // If so, add it back
    conversation.members.forEach((member) => {
        if (!member.conversations.includes(conversationID)) {
            member.conversations.push(conversationID);
            member.save();
        }
    });

    // For all participant of the conversation
    // make the conversation appear at the top
    conversation.members.forEach((member) => {
        member.conversations.sort((a, b) => {
            if (a === conversationID) return -1;
            if (b === conversationID) return 1;
            return 0;
        });
        member.save();
    });

    const message = new Message(messageContent);
    await message.save();

    conversation.messages.push(message);
    await conversation.save();

    return "Message sent";
};

export default sendMessage;
