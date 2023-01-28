import User from "../../models/User";
import mongoose from "mongoose";
import cloudinary from "../../cloudinary";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "10mb",
        },
    },
};

const updateAvatar = async (userIDUnclean, data) => {
    if (!userIDUnclean) return { error: "No user ID provided" };

    if (!mongoose.Types.ObjectId.isValid(userIDUnclean))
        return { error: "Invalid user ID" };

    const userID = mongoose.Types.ObjectId(userIDUnclean);

    const user = await User.findById(userID);
    if (!user) return { error: "User not found" };

    if (!data) return { error: "No data provided" };

    const { avatar } = data;

    if (!avatar) return { error: "No avatar provided" };

    const { secure_url } = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        public_id: userID,
    });

    user.avatar = secure_url;
    await user.save();

    return { success: true, avatar: user.avatar };
};

export default updateAvatar;
