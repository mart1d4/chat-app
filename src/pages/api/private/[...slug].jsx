import connectDB from "../../../utils/connectDB";
import {
    getChannelMessages,
} from "../../../utils/api/getters";
import {
    removePrivateChannel,
    sendPrivateMessage,
    editPrivateMessage,
} from "../../../utils/api/posters";

connectDB();

export default async (req, res) => {
    const { slug } = req.query;
    const body = req.body;
    const channelID = slug[0];

    if (req.method === "POST") {
        if (slug[1] === "remove") {
            const data = await removePrivateChannel(channelID, body.userID);
            res.status(200).json(data);
        } else if (slug[1] === "send") {
            const data = await sendPrivateMessage(channelID, body.message);
            res.status(200).json(data);
        } else if (slug[1] === "edit") {
            const data = await editPrivateMessage(channelID, body.messageID, body.newMessage);
            res.status(200).json(data);
        } else {
            return res.status(400).json({ error: "Invalid request" });
        }
    }

    if (req.method === "GET") {
        if (slug[1] === "messages") {
            const data = await getChannelMessages(channelID);
            res.status(200).json(data);
        } else {
            return res.status(400).json({ error: "Invalid request" });
        }
    }

    return res.status(400).json({ error: "Invalid request" });
};
