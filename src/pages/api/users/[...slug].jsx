import User from "../../../utils/models/User";
import connectDB from "../../../utils/connectDB";

connectDB();

export default async (req, res) => {
    const { slug } = req.query;
    const userID = slug[0];

    // Bad request
    if (slug[2]) {
        return res.status(400).json({ error: "Bad request" });
    }

    if (slug[1] === "friends") {
        const user = await User.findById(userID);
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
};
