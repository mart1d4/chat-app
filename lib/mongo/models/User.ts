import mongoose from "mongoose";
const Schema = mongoose.Schema;

type DefaultAvatarType = {
    avatar: string;
    color: string;
}[];

const defaults: DefaultAvatarType = [
    {
        avatar: "/assets/avatars/blue.png",
        color: "#5a63f2",
    },
    {
        avatar: "/assets/avatars/green.png",
        color: "#38a65a",
    },
    {
        avatar: "/assets/avatars/grey.png",
        color: "#757e8a",
    },
    {
        avatar: "/assets/avatars/red.png",
        color: "#ed4546",
    },
    {
        avatar: "/assets/avatars/yellow.png",
        color: "#faa519",
    },
];

const userSchema = new Schema<UncleanUserType>(
    {
        username: {
            type: String,
            minlength: 2,
            maxlength: 32,
            trim: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
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
        guilds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Guild",
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

userSchema.pre("save", async function () {
    if (!this.avatar && !this.accentColor) {
        const index = Math.floor(Math.random() * defaults.length);

        this.avatar = defaults[index].avatar;
        this.accentColor = defaults[index].color;
    }
});

const User = mongoose.models && "User" in mongoose.models ? mongoose.models.User : mongoose.model("User", userSchema);
export default User;
