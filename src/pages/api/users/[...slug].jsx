import User from "../../../utils/models/User";
import Conversation from "../../../utils/models/Conversation";
import connectDB from "../../../utils/connectDB";
import mongoose from "mongoose";

connectDB();

export default async (req, res) => {
    const { slug } = req.query;
    const userID = slug[0];
    const friendID = slug[2];

    const user = await User.findById(userID);
    let friend;
    if (mongoose.Types.ObjectId.isValid(friendID)) {
        friend = await User.findById(friendID);
    }

    if (slug[1] === "channels") {
        if (req.method === "POST") {
            if (!user.friends.includes(friendID)) {
                return res.status(200).json({ error: "Not friends" });
            }

            const conversation = await Conversation.findOne({
                participants: { $all: [userID, friendID] },
            });

            if (conversation) {
                const message = {
                    sender: userID,
                    content: req.body.content,
                };

                conversation.messages.push(message);
                await conversation.save();

                return res.status(200).json({ success: "Message sent" });
            } else {
                const newConversation = new Conversation({
                    participants: [userID, friendID],
                    messages: [
                        {
                            sender: userID,
                            content: req.body.content,
                        },
                    ],
                });

                await newConversation.save();

                return res.status(200).json({ success: "Message sent" });
            }
        }

        if (req.method === "GET") {
            if (!user.friends.includes(friendID)) {
                return res.status(200).json({ error: "Not friends" });
            }

            const conversation = await Conversation.findOne({
                participants: { $all: [userID, friendID] },
            }).populate("messages.sender");

            if (conversation) {
                return res.status(200).json(conversation);
            } else {
                return res.status(200).json({ error: "No conversation" });
            }
        }
    }

    if (slug[1] === "friends" && slug[3] == "add") {
        if (friendID === userID) {
            return res.status(200).json({ error: "Cannot add yourself" });
        }

        if (friend.friendRequests.received.includes(userID)) {
            return res.status(200).json({ error: "Request already sent" });
        }

        if (friend.friendRequests.sent.includes(userID)) {
            return res.status(200).json({
                error: "Request already received from this user",
            });
        }

        if (friend.friends.includes(userID)) {
            return res
                .status(200)
                .json({ error: "User is already your friend" });
        }

        friend.friendRequests.received.push(userID);
        user.friendRequests.sent.push(friendID);

        await friend.save();
        await user.save();

        return res.status(200).json({ success: "Friend request sent" });
    }

    if (slug[1] === "friends") {
        if (slug[2] === "received") {
            const friendRequests = await User.find({
                _id: { $in: user.friendRequests.received },
            }).populate("friendRequests.received");

            const friendRequestsClean = friendRequests.map((friend) => {
                return {
                    _id: friend._id,
                    username: friend.username,
                    avatar: friend.avatar,
                    status: friend.status,
                    customStatus: friend.customStatus,
                };
            });

            return res.status(200).json(friendRequestsClean);
        } else if (slug[2] === "sent") {
            const friendRequests = await User.find({
                _id: { $in: user.friendRequests.sent },
            }).populate("friendRequests.sent");

            const friendRequestsClean = friendRequests.map((friend) => {
                return {
                    _id: friend._id,
                    username: friend.username,
                    avatar: friend.avatar,
                    status: friend.status,
                    customStatus: friend.customStatus,
                };
            });

            return res.status(200).json(friendRequestsClean);
        } else if (slug[2] === "blocked") {
            const blocked = await User.find({
                _id: { $in: user.blocked },
            }).populate("blocked");

            const blockedClean = blocked.map((friend) => {
                return {
                    _id: friend._id,
                    username: friend.username,
                    avatar: friend.avatar,
                    status: friend.status,
                    customStatus: friend.customStatus,
                };
            });

            return res.status(200).json(blockedClean);
        } else if (slug[3] === "accept") {
            friend.friends.push(userID);
            user.friends.push(friendID);

            friend.friendRequests.sent = friend.friendRequests.sent.filter(
                (request) => {
                    return request.toString() !== userID;
                }
            );
            friend.friendRequests.received = friend.friendRequests.received.filter(
                (request) => {
                    return request.toString() !== userID;
                }
            );
            user.friendRequests.sent = user.friendRequests.sent.filter((request) => {
                return request.toString() !== friendID;
            });
            user.friendRequests.received = user.friendRequests.received.filter((request) => {
                return request.toString() !== friendID;
            });

            await friend.save();
            await user.save();

            const conversation = await Conversation.findOne({
                participants: { $all: [userID, friendID] },
            });

            if (conversation) {
                return res
                    .status(200)
                    .json({ success: "Friend request accepted" });
            }

            const newConversation = new Conversation({
                participants: [userID, friendID],
            });

            await newConversation.save();

            return res.status(200).json({ success: "Friend request accepted" });
        } else if (slug[3] === "decline") {
            friend.friendRequests.sent = friend.friendRequests.sent.filter(
                (request) => {
                    return request.toString() !== userID;
                }
            );
            friend.friendRequests.received = friend.friendRequests.received.filter(
                (request) => {
                    return request.toString() !== userID;
                }
            );
            user.friendRequests.sent = user.friendRequests.sent.filter((request) => {
                return request.toString() !== friendID;
            });
            user.friendRequests.received = user.friendRequests.received.filter((request) => {
                return request.toString() !== friendID;
            });

            await friend.save();
            await user.save();

            return res.status(200).json({ success: "Friend request declined" });
        } else if (slug[3] === "cancel") {
            friend.friendRequests.sent = friend.friendRequests.sent.filter(
                (request) => {
                    return request.toString() !== userID;
                }
            );
            friend.friendRequests.received = friend.friendRequests.received.filter(
                (request) => {
                    return request.toString() !== userID;
                }
            );
            user.friendRequests.sent = user.friendRequests.sent.filter((request) => {
                return request.toString() !== friendID;
            });
            user.friendRequests.received = user.friendRequests.received.filter((request) => {
                return request.toString() !== friendID;
            });

            await friend.save();
            await user.save();

            return res
                .status(200)
                .json({ success: "Friend request cancelled" });
        } else if (slug[3] === "remove") {
            friend.friends = friend.friends.filter((friend) => {
                return friend.toString() !== userID;
            });
            user.friends = user.friends.filter((friend) => {
                return friend.toString() !== friendID;
            });

            await friend.save();
            await user.save();

            return res.status(200).json({ success: "Friend removed" });
        } else if (slug[3] === "unblock") {
            user.blocked = user.blocked.filter((blocked) => {
                return blocked.toString() !== friendID;
            });

            await user.save();

            return res.status(200).json({ success: "User unblocked" });
        } else {
            const friends = await User.find({ _id: { $in: user.friends } });

            const friendsClean = friends.map((friend) => {
                return {
                    _id: friend._id,
                    username: friend.username,
                    avatar: friend.avatar,
                    status: friend.status,
                    customStatus: friend.customStatus,
                };
            });
            return res.status(200).json(friendsClean);
        }
    }
};
