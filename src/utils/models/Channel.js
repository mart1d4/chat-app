import mongoose from "mongoose";
const Schema = mongoose.Schema;

const channelSchema = new Schema(
    {
        recipients: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        type: {
            type: Number,
            enum: [0, 1, 2, 3, 4],
        },
        guildID: {
            type: Schema.Types.ObjectId,
            ref: "Guild",
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
            ref: "User",
        },
        rateLimit: {
            type: Number,
        },
        permissions: {
            type: Array,
        },
        parentID: {
            type: Schema.Types.ObjectId,
            ref: "Channel",
        },
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: "Message",
            },
        ],
        pinnedMessages: [
            {
                type: Schema.Types.ObjectId,
                ref: "Message",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Channel =
    mongoose.models.Channel ||
    mongoose.model("Channel", channelSchema);
export default Channel;
