import mongoose from "mongoose";
const Schema = mongoose.Schema;

async function getRandomAvatar() {
    const response = await fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API_KEY}&tag=&rating=g`
    );
    const json = await response.json();
    const avatarUrl = json.data.images.downsized.url;
    return avatarUrl;
}

function getAvatarurl() {
    return getRandomAvatar();
}

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
        email: {
            type: String,
        },
        avatar: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            default: "user",
        },
        friendRequests: {
            sent: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            received: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
        },
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
        status: {
            type: String,
            default: "offline",
        },
        customStatus: {
            type: String,
            default: "",
        },
        conversations: [
            {
                type: Schema.Types.ObjectId,
                ref: "Conversation",
                default: [],
            },
        ],
        notifications: [
            {
                content: {
                    type: String,
                    default: "",
                },
                sender: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                sentAt: {
                    type: Date,
                    default: Date.now,
                },
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
        this.avatar = await getAvatarurl();
    }
});

userSchema.virtual("url").get(function () {
    return `/users/${this._id}`;
});

userSchema.virtual("createdAtFormatted").get(function () {
    return this.createdAt.toLocaleString();
});

userSchema.virtual("updatedAtFormatted").get(function () {
    return this.updatedAt.toLocaleString();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
