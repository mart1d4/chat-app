import connectDB from "../../../../utils/connectDB";
import mongoose from "mongoose";
import Channel from "../../../../utils/models/Channel";
import User from "../../../../utils/models/user";

connectDB();

export default async (req, res) => {
    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    const { channelID } = req.query;

    if (!mongoose.Types.ObjectId.isValid(channelID)) {
        return res.status(400).json({ error: "Invalid channel ID" });
    }

    if (req.method === "DELETE") {
        const channel = await Channel.findById(channelID);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }

        // If DM channel, remove the channel from the user's DMs
        if (channel.type === 0 || channel.type === 1) {
            const user = await User.findById(userJson._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            const channelIndex = user.channels.findIndex(
                (channel) => channel.toString() === channelID
            );

            if (channelIndex !== -1) {
                user.channels.splice(channelIndex, 1);
            } else {
                return res.status(404).json({
                    success: false,
                    message: "DM channel not found",
                });
            }

            await user.save();

            return res.status(200).json({
                success: true,
                message: "DM channel deleted",
            });
        }
    }
};
