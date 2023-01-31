import connectDB from "../../../utils/connectDB";
import {
    getChannelMessages,
} from "../../../utils/api/getters";
import {
    removePrivateChannel,
    sendPrivateMessage,
    editPrivateMessage,
    deletePrivateMessage,
} from "../../../utils/api/posters";

connectDB();

export default async (req, res) => {
    const { slug } = req.query;
    const body = req.body;
    const channelID = slug[0];
    const messageID = slug[2];

    console.log(body);

    if (req.method === "POST") {
        if (slug[1] === "send") {
            const data = await sendPrivateMessage(channelID, body.message);
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ error: "Invalid request" });
        }
    }

    if (req.method === "GET") {
        if (slug[1] === "messages") {
            const data = await getChannelMessages(channelID);
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ error: "Invalid request" });
        }
    }

    if (req.method === "DELETE") {
        if (slug[1] === "remove") {
            const data = await removePrivateChannel(channelID, body.userID);
            return res.status(200).json(data);
        } else if (slug[1] === "messages") {
            const data = await deletePrivateMessage(channelID, messageID);
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ error: "Invalid request" });
        }
    }

    if (req.method === "PUT") {
        if (slug[1] === "edit") {
            const data = await editPrivateMessage(channelID, body.messageID, body.newMessage);
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ error: "Invalid request" });
        }
    }

    return res.status(400).json({ error: "Invalid request" });
};
