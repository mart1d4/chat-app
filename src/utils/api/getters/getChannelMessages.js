import Channel from "../../models/Channel";

const getChannelMessages = async (conversationID) => {
    if (!conversationID) return { error: "No conversation ID provided" };

    const channel = await Channel.findById(conversationID).populate({
        path: "messages",
        populate: {
            path: "sender",
        },
    });

    if (!channel) return { error: "No conversation found" };

    // Clean the channel's messages so there's no sensitive data being sent
    const cleanMessages = channel.messages.map((message) => {
        const cleanMessage = {
            _id: message._id,
            sender: {
                _id: message.sender._id,
                username: message.sender.username,
                avatar: message.sender.avatar,
                description: message.sender.description,
                customStatus: message.sender.customStatus,
                status: message.sender.status,
                createdAt: message.sender.createdAt,
            },
            content: message.content,
            createdAt: message.createdAt,
        };
        return cleanMessage;
    });

    return cleanMessages;
};

export default getChannelMessages;
