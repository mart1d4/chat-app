import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
    {
        type: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            default: "",
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const Notification =
    mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;
