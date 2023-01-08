import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const convSchema = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        messages: [
            {
                sender: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                content: {
                    type: String,
                    default: '',
                },
                sentAt: {
                    type: Date,
                    default: Date.now,
                },
                edited: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

convSchema.virtual('url').get(function () {
    return `/conversations/${this._id}`;
});

convSchema.virtual('createdAtFormatted').get(function () {
    return this.createdAt.toLocaleString();
});

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', convSchema);  
export default Conversation;
