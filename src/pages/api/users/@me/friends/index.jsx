import User from "../../../../../utils/models/User";
import connectDB from "../../../../../utils/connectDB";
import cleanUser from "../../../../../utils/cleanUser";

connectDB();

export default async (req, res) => {
    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    if (req.method === "GET") {
        const user = await User.findById(userJson._id).populate("friends");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        user.friends.map((friend) => {
            return cleanUser(friend);
        });

        return res.json({
            success: true,
            friends: user.friends,
        });
    } else {
        return res.status(405).json({ success: false, message: "Method not allowed." });
    }
}
