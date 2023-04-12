import mongoose from "mongoose";
import Channel from "../../../../../utils/models/Channel";
import Message from "../../../../../utils/models/Message";
import connectDB from "../../../../../utils/connectDB";

connectDB();

export default async (req, res) => {
    const channelID = req.query.channelID;

    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    if (!mongoose.Types.ObjectId.isValid(channelID)) {
        return res.status(400).json({
            success: false,
            message: "Invalid channel ID."
        });
    }

    const channel = await Channel.findById(channelID)
        .populate("messages")
        .populate("recipients")
        .populate({
            path: "messages",
            populate: {
                path: "author",
                model: "User",
            }
        })
        .populate({
            path: "messages",
            populate: {
                path: "messageReference",
                model: "Message",
            }
        })
        .populate({
            path: "messages",
            populate: {
                path: "messageReference",
                populate: {
                    path: "author",
                    model: "User",
                }
            }
        });

    if (!channel) {
        return res.status(404).json({
            success: false,
            message: "Channel not found."
        });
    }

    if (req.method === "GET") {
        const limit = req.body.limit || 50;
        const before = req.body.before || null;

        const messagesReverse = channel.messages.reverse();

        if (before) {
            const index = messagesReverse.findIndex(message => message.createdAt === before);

            if (index === -1) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid before message."
                });
            }

            const messagesLimited = messagesReverse.slice(index + 1, index + 1 + limit);
            const messages = messagesLimited.reverse();
            const hasMoreMessages = channel.messages.length > index + 1 + limit;

            return res.status(200).json({
                success: true,
                messages,
                hasMoreMessages,
            });

        } else {
            const messagesLimited = messagesReverse.slice(0, limit);
            const messages = messagesLimited.reverse();

            const hasMoreMessages = channel.messages.length > limit;

            for (const message of messages) {
                if (message.type === 1) {
                    const messageReference = await Message.findById(message.messageReference);
                    message.messageReference = messageReference;
                }
            }

            res.status(200).json({
                success: true,
                messages,
                hasMoreMessages,
            });
        }
    } else if (req.method === "POST") {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required."
            });
        }

        if (message.messageReference !== null && !mongoose.Types.ObjectId.isValid(message.messageReference)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message reference ID."
            });
        }

        const newMessage = new Message({
            reactions: [],
            attachments: message.attachments || [],
            embeds: message.embeds || [],
            mentionEveryone: message.mentionEveryone || false,
            pinned: false,
            author: userJson._id,
            mentionRoles: message.mentionRoles || [],
            content: message.content || "",
            channel: channelID,
            mentions: message.mentions || [],
            messageReference: message.messageReference || null,
            type: message.messageReference ? 1 : 0,
        });

        channel.messages.push(newMessage._id);

        await newMessage.save();
        await channel.save();

        // Add channel to recipient's channels if they're not already in it
        for (const recipient of channel.recipients) {
            if (!recipient.channels.includes(channelID)) {
                recipient.channels.unshift(channelID);
                await recipient.save();
            } else {
                const index = recipient.channels.indexOf(channelID);
                recipient.channels.splice(index, 1);
                recipient.channels.unshift(channelID);
                await recipient.save();
            }
        }

        const messageRef = await Message.findById(newMessage.messageReference);

        res.status(200).json({
            success: true,
            message: {
                ...newMessage._doc,
                author: userJson,
                messageReference: messageRef,
            }
        });
    } else {
        res.status(400).json({
            success: false,
            message: "Invalid request method."
        });
    }
}
