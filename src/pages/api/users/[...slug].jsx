import connectDB from "../../../utils/connectDB";
import {
    getBlocked,
    getConversation,
    getAllConversations,
    getFriends,
    getRequestsReceived,
    getRequestsSent,
} from "../../../utils/api/getters";
import {
    acceptFriend,
    addConversation,
    addFriend,
    blockUser,
    cancelFriend,
    declineFriend,
    removeConversation,
    removeFriend,
    sendMessage,
    unblockUser,
} from "../../../utils/api/posters";

connectDB();

export default async (req, res) => {
    const { slug } = req.query;
    const userID = slug[0];
    const friendID = slug[2];

    // POST Requests
    if (slug[1] === "friends") {
        if (slug[3] === "request") {
            const { data } = await addFriend(userID, friendID);
            res.status(200).json(data);
        } else if (slug[3] === "cancel") {
            const { data } = await cancelFriend(userID, friendID);
            res.status(200).json(data);
        } else if (slug[3] === "accept") {
            const { data } = await acceptFriend(userID, friendID);
            res.status(200).json(data);
        } else if (slug[3] === "decline") {
            const { data } = await declineFriend(userID, friendID);
            res.status(200).json(data);
        } else if (slug[3] === "remove") {
            const { data } = await removeFriend(userID, friendID);
            res.status(200).json(data);
        } else if (slug[3] === "block") {
            const { data } = await blockUser(userID, friendID);
            res.status(200).json(data);
        } else if (slug[3] === "unblock") {
            const { data } = await unblockUser(userID, friendID);
            res.status(200).json(data);
        }
    }

    if (slug[1] === "channels") {
        if (slug[3] === "add") {
            const { data } = await addConversation(userID, friendID);
            res.status(200).json(data);
        } else if (slug[3] === "remove") {
            const { data } = await removeConversation(userID, friendID);
            res.status(200).json(data);
        } else if (slug[3] === "send") {
            const { data } = await sendMessage(friendID, req.body.message);
            res.status(200).json(data);
        } else if (slug[3] === "get") {
            const conversation = await getConversation(friendID);
            res.status(200).json(conversation);
        } else {
            const conversations = await getAllConversations(userID);
            res.status(200).json(conversations);
        }
    }

    // GET Requests

    if (slug[1] === "friends") {
        if (slug[2] === "received") {
            const requestsReceived = await getRequestsReceived(userID);
            res.json(requestsReceived);
        } else if (slug[2] === "sent") {
            const requestsSent = await getRequestsSent(userID);
            res.json(requestsSent);
        } else if (slug[2] === "blocked") {
            const blocked = await getBlocked(userID);
            res.json(blocked);
        } else {
            const friends = await getFriends(userID);
            res.json(friends);
        }
    }

    else {
        return res.status(400).json({ error: "Invalid request" });
    }
};
