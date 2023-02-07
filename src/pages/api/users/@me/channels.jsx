import User from "../../../../utils/models/User";
import Channel from "../../../../utils/models/Channel";
import mongoose from "mongoose";
import connectDB from "../../../../utils/connectDB";
import cleanUser from "../../../../utils/cleanUser";

connectDB();

export default async (req, res) => {
    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    let user;

    if (
        req.method === "GET" ||
        req.method === "POST"
    ) {
        const userID = userJson._id;

        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        user = await User.findById(userID).populate("channels").populate({
            path: "channels",
            populate: {
                path: "recipients",
                model: "User",
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
    }

    if (req.method === "GET") {
        const channels = user.channels.filter((channel) => [0, 1].includes(channel.type));
        channels?.recipients?.map((recipient) => cleanUser(recipient));

        return res.json({ success: true, channels });
    } else if (req.method === "POST") {
        const { recipients } = req.body;
        let recipientsObjects = [];

        if (!typeof recipients === "array") {
            return res.status(400).json({ success: false, message: "Invalid recipients." });
        } else if (recipients.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid recipients." });
        } else if (recipients.length > 9) {
            return res.status(400).json({ success: false, message: "Too many recipients." });
        }

        for (const recipient of recipients) {
            if (!mongoose.Types.ObjectId.isValid(recipient)) {
                return res.status(400).json({ message: "Invalid recipients." });
            }

            const recipientUser = await User.findById(recipient);

            if (!recipientUser) {
                return res.status(404).json({ message: "Recipient not found." });
            }

            if (recipientUser._id.toString() === user._id.toString()) {
                return res.status(400).json({ message: "Cannot add self as recipient." });
            }

            recipientsObjects.push(recipientUser);
        }

        const dmChannels = user.channels.filter((channel) => [0, 1].includes(channel.type));

        const sameChannel = dmChannels.find((channel) => {
            const channelRecipients = channel.recipients.map(
                (recipient) => recipient._id.toString()
            );
            const recipientsString = [...recipients, user._id.toString()];

            return (channelRecipients.every(
                (recipient) => recipientsString.includes(recipient)
            ) && recipientsString.every(
                (recipient) => channelRecipients.includes(recipient))
            );
        });

        if (sameChannel) {
            return res.json({
                success: true,
                channel: sameChannel,
                recipients: recipientsObjects,
                message: "Channel already exists",
            });
        } else {
            const channel = await Channel.create({
                type: recipients.length === 1 ? 0 : 1,
                recipients: [...recipients, user._id],
            });

            user.channels.unshift(channel._id);
            await user.save();

            for (const recipient of recipientsObjects) {
                const recipientHasChannel = recipient.channels.find((chan) => {
                    return chan.toString() === channel._id.toString();
                });

                if (!recipientHasChannel) {
                    recipient.channels.unshift(channel._id);
                    await recipient.save();
                }
            }

            return res.json({
                success: true,
                channel: {
                    ...channel,
                    recipients: recipientsObjects,
                },
                message: "Channel created",
            });
        }
    } else {
        res.status(400).json({ success: false, message: "Invalid request method." });
    }
}
