import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        type: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 8,
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "Channel",
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 4000,
            trim: true,
        },
        attachments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Attachment",
            },
        ],
        embeds: [
            {
                type: Schema.Types.ObjectId,
                ref: "Embed",
            },
        ],
        messageReference: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        reactions: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 0,
                    min: 0,
                },
                emoji: {
                    _id: {
                        type: Schema.Types.ObjectId,
                        ref: "Emoji",
                    },
                    name: {
                        type: String,
                        required: true,
                        maxlength: 32,
                        trim: true,
                    },
                },
                me: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        mentions: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        mentionRoles: [
            {
                type: Schema.Types.ObjectId,
                ref: "Role",
            },
        ],
        mentionChannels: [
            {
                type: Schema.Types.ObjectId,
                ref: "Channel",
            },
        ],
        mentionEveryone: {
            type: Boolean,
            default: false,
        },
        pinned: {
            type: Boolean,
            default: false,
        },
        edited: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Message =
    mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
