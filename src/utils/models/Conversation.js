import mongoose from "mongoose";
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
    {
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        messages: [
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

conversationSchema.virtual("url").get(function () {
    return `/friends/channels/${this._id}`;
});

const Conversation =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", conversationSchema);
export default Conversation;
