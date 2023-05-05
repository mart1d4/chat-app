import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const defaultChannelIcons: string[] = [
    '/assets/channel-avatars/blue.png',
    '/assets/channel-avatars/green.png',
    '/assets/channel-avatars/orange.png',
    '/assets/channel-avatars/blue-green.png',
    '/assets/channel-avatars/purple.png',
    '/assets/channel-avatars/red.png',
    '/assets/channel-avatars/yellow.png',
];

const channelSchema = new Schema<ChannelType>(
    {
        recipients: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        type: {
            type: Number,
            enum: [0, 1, 2, 3, 4],
        },
        guild: {
            type: Schema.Types.ObjectId,
            ref: 'Guild',
        },
        position: {
            type: Number,
        },
        name: {
            type: String,
        },
        topic: {
            type: String,
        },
        nsfw: {
            type: Boolean,
        },
        icon: {
            type: String,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        rateLimit: {
            type: Number,
        },
        permissions: {
            type: Array,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'Channel',
        },
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Message',
            },
        ],
        pinnedMessages: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Message',
            },
        ],
    },
    {
        timestamps: true,
    }
);

channelSchema.pre('save', async function () {
    if (!this.icon) {
        const index = Math.floor(Math.random() * defaultChannelIcons.length);
        this.icon = defaultChannelIcons[index];
    }
});

const Channel =
    mongoose.models.Channel || mongoose.model('Channel', channelSchema);
export default Channel;
