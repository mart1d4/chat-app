import mongoose, { get } from "mongoose";
const Schema = mongoose.Schema;

const defaultAvatars = [
    "/assets/default-avatars/blue.png",
    "/assets/default-avatars/green.png",
    "/assets/default-avatars/grey.png",
    "/assets/default-avatars/red.png",
    "/assets/default-avatars/yellow.png",
]

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
            default: defaultAvatars[
                Math.floor(Math.random() * defaultAvatars.length)
            ],
        },
        banner: {
            type: String,
        },
        description: {
            type: String,
        },
        customStatus: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Online", "Offline", "Idle", "Do Not Disturb"],
            default: "Offline",
        },
        accentColor: {
            type: String,
            default: "#737e8c",
        },
        system: {
            type: Boolean,
            default: false,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        requests: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                type: {
                    type: Number,
                    enum: [0, 1],
                }
            },
        ],
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        blocked: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        channels: [
            {
                type: Schema.Types.ObjectId,
                ref: "Channel",
            },
        ],
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
