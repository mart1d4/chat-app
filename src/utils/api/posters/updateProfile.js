import User from "../../models/User";
import mongoose from "mongoose";

const updateProfile = async (userIDUnclean, data) => {
    if (!userIDUnclean) return { error: "No user ID provided" };

    if (!mongoose.Types.ObjectId.isValid(userIDUnclean))
        return { error: "Invalid user ID" };

    const userID = mongoose.Types.ObjectId(userIDUnclean);

    const isAlreadyRegistered = await User.exists({ username: data.username });
    if (isAlreadyRegistered) return { error: "Username already taken" };

    const user = await User.findById(userID);
    if (!user) return { error: "User not found" };

    if (data.username) user.username = data.username;
    await user.save();

    return { user };
};

export default updateProfile;
