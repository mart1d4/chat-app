import mongoose from "mongoose";
import connectDB from "../../../../../utils/connectDB";
import Channel from "../../../../../utils/models/Channel";

connectDB();

export default async (req, res) => {
    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    const { channelID } = req.query;

    if (!mongoose.Types.ObjectId.isValid(channelID)) {
        return res.status(400).json({ error: "Invalid channel ID" });
    }

    if (req.method === "GET") {
        const channel = await Channel.findById(channelID).populate("pinnedMessages");

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }

        const pins = channel.pinnedMessages;

        return res.status(200).json({
            success: true,
            pins,
        });
    }
};
