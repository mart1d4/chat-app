import User from "../../../../utils/models/User";
import connectDB from "../../../../utils/connectDB";
import cleanUser from "../../../../utils/cleanUser";

connectDB();

export default async (req, res) => {
    const userString = req.headers.user;
    const userJson = JSON.parse(userString);

    if (req.method === "GET") {
        const user = await User.findById(userJson._id).populate({
            path: "requests",
            populate: {
                path: "user",
                model: "User",
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        user.requests.map((request) => {
            return {
                user: cleanUser(request.user),
                type: request.type,
            };
        });

        return res.json({
            success: true,
            requests: user.requests,
        });
    } else {
        return res.status(405).json({
            success: false,
            message: "Method not allowed."
        });
    }
}
