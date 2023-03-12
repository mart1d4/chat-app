import User from "../../../../utils/models/User";
import Channel from "../../../../utils/models/Channel";
import mongoose from "mongoose";
import connectDB from "../../../../utils/connectDB";
import cleanUser from "../../../../utils/cleanUser";

connectDB();

const defaultChannelIcons = [
    "/assets/default-channel-avatars/blue.png",
    "/assets/default-channel-avatars/green.png",
    "/assets/default-channel-avatars/orange.png",
    "/assets/default-channel-avatars/blue-green.png",
    "/assets/default-channel-avatars/purple.png",
    "/assets/default-channel-avatars/red.png",
    "/assets/default-channel-avatars/yellow.png",
];

const index = Math.floor(Math.random() * defaultChannelIcons.length);

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

        const sameChannel = await Channel.findOne({
            type: recipients.length === 1 ? 0 : 1,
            recipients: { $all: [...recipients, user._id] },
        }).populate("recipients");

        if (sameChannel) {
            const userHasChannel = user.channels.find((chan) => {
                return chan._id.toString() === sameChannel._id.toString();
            });

            recipientsObjects = recipientsObjects.map((recipient) => cleanUser(recipient));

            if (!userHasChannel) {
                user.channels.unshift(sameChannel._id);
                await user.save();

                return res.json({
                    success: true,
                    channel: {
                        _id: sameChannel._id,
                        recipients: [...recipientsObjects, cleanUser(user)],
                        type: sameChannel.type,
                        icon: sameChannel.icon || null,
                        name: sameChannel.name || null,
                        owner: sameChannel.owner || null,
                    },
                    message: "Channel created",
                });
            }

            return res.json({
                success: true,
                channel: {
                    _id: sameChannel._id,
                    recipients: [...recipientsObjects, cleanUser(user)],
                    type: sameChannel.type,
                    icon: sameChannel.icon || null,
                    name: sameChannel.name || null,
                    owner: sameChannel.owner || null,
                },
                message: "Channel already exists",
            });
        } else {
            const channelName = recipientsObjects.map((recipient) => recipient.username).join(", ");

            const channel = await Channel.create({
                type: recipients.length === 1 ? 0 : 1,
                recipients: [...recipients, user._id],
                icon: defaultChannelIcons[index],
                name: recipients.length > 1 ? channelName : null,
                owner: recipients.length > 1 ? user._id : null,
            });

            user.channels.unshift(channel._id);
            await user.save();

            // If user isn't friend, don't add channel to recipient
            if (
                recipients.length === 1 &&
                !user.friends.find((friend) => friend._id.toString() === recipients[0])
            ) {
                return res.json({
                    success: true,
                    channel: {
                        _id: channel._id,
                        recipients: [...recipientsObjects, cleanUser(user)],
                        type: channel.type,
                        icon: channel.icon || null,
                        name: channelName || null,
                        owner: channel.owner || null,
                    },
                    message: "Channel created",
                });
            }

            for (const recipient of recipientsObjects) {
                recipient.channels.unshift(channel._id);
                await recipient.save();
            }

            recipientsObjects = recipientsObjects.map((recipient) => cleanUser(recipient));

            return res.json({
                success: true,
                channel: {
                    _id: channel._id,
                    recipients: [...recipientsObjects, cleanUser(user)],
                    type: channel.type,
                    icon: channel.icon || null,
                    name: channelName || null,
                    owner: channel.owner || null,
                },
                message: "Channel created",
            });
        }
    } else {
        res.status(400).json({ success: false, message: "Invalid request method." });
    }
}
