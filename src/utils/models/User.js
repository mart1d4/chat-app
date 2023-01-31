import mongoose from "mongoose";
const Schema = mongoose.Schema;

// async function getRandomAvatar() {
//     const response = await fetch(
//         `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API_KEY}&tag=&rating=g`
//     );
//     const json = await response.json();
//     const avatarUrl = json.data.images.downsized.url;
//     return avatarUrl;
// }

// function getAvatarurl() {
//     return getRandomAvatar();
// }

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
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        customStatus: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["Online", "Offline", "Away", "Busy"],
            default: "Offline",
        },
        friendRequests: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                type: {
                    type: String,
                }
            },
        ],
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        blockedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        privateChannels: [
            {
                type: Schema.Types.ObjectId,
                ref: "Channel",
            },
        ],
        notifications: [
            {
                type: Schema.Types.ObjectId,
                ref: "Notification",
            },
        ],
        refreshToken: String,
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (this.avatar === "") {
        this.avatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
