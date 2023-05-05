import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const defaultAvatars: string[] = [
    '/assets/avatars/blue.png',
    '/assets/avatars/green.png',
    '/assets/avatars/grey.png',
    '/assets/avatars/red.png',
    '/assets/avatars/yellow.png',
];

const defaultColors: string[] = [
    '#5a63f2',
    '#38a65a',
    '#757e8a',
    '#ed4546',
    '#faa519',
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
            enum: ['Online', 'Offline', 'Idle', 'Do Not Disturb'],
            default: 'Offline',
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
                    ref: 'User',
                },
                type: {
                    type: Number,
                    enum: [0, 1],
                },
            },
        ],
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        blocked: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        channels: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Channel',
            },
        ],
        guilds: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Guild',
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

userSchema.pre('save', async function () {
    if (!this.avatar && !this.accentColor) {
        const index = Math.floor(Math.random() * defaultAvatars.length);
        this.avatar = defaultAvatars[index];
        this.accentColor = defaultColors[index];
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
