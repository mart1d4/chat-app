import connectDB from "../../../utils/connectDB";
import {
    getFriends,
    getFriendRequests,
    getBlockedUsers,
    getChannelList,
} from "../../../utils/api/getters";
import {
    createPrivateChannel,
    requestFriend,
    cancelFriendRequest,
    acceptFriendRequest,
    ignoreFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
} from "../../../utils/api/posters";

connectDB();

export default async (req, res) => {
    const { slug } = req.query;
    const friendID = req.body.userID;
    const userID = slug[0];

    if (req.method === "POST") {
        if (slug[1] === "friends") {
            if (slug[2] === "request") {
                const data = await requestFriend(userID, friendID);
                res.status(200).json(data);
            } else if (slug[2] === "cancel") {
                const data = await cancelFriendRequest(userID, friendID);
                res.status(200).json(data);
            } else if (slug[2] === "accept") {
                const data = await acceptFriendRequest(userID, friendID);
                res.status(200).json(data);
            } else if (slug[2] === "ignore") {
                const data = await ignoreFriendRequest(userID, friendID);
                res.status(200).json(data);
            } else if (slug[2] === "remove") {
                const data = await removeFriend(userID, friendID);
                res.status(200).json(data);
            } else if (slug[2] === "block") {
                const data = await blockUser(userID, friendID);
                res.status(200).json(data);
            } else if (slug[2] === "unblock") {
                const data = await unblockUser(userID, friendID);
                res.status(200).json(data);
            } else if (slug[2] === "create") {
                const data = await createPrivateChannel(userID, friendID);
                res.status(200).json(data);
            } else {
                return res.status(400).json({ error: "Invalid request" });
            }
        }
    }

    if (req.method === "GET") {
        if (slug[1] === "friends") {
            const data = await getFriends(userID);
            res.status(200).json(data);
        } else if (slug[1] === "friendRequests") {
            const data = await getFriendRequests(userID);
            res.status(200).json(data);
        } else if (slug[1] === "blocked") {
            const data = await getBlockedUsers(userID);
            res.status(200).json(data);
        } else if (slug[1] === "private" && slug[2] === "channels") {
            const data = await getChannelList(userID);
            res.status(200).json(data);
        } else {
            return res.status(400).json({ error: "Invalid request" });
        }
    }

    return res.status(400).json({ error: "Invalid request" });
};
