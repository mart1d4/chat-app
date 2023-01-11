import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        content: {
            type: String,
            default: "",
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        edited: {
            type: Boolean,
            default: false,
        },
        editedContent: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Message =
    mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
