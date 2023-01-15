import mongoose from "mongoose";
const Schema = mongoose.Schema;

const channelSchema = new Schema(
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
        type: {
            type: String,
            enum: ["private", "public"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

channelSchema.virtual("url").get(function () {
    return `/channels/${this._id}`;
});

const Channel =
    mongoose.models.Channel ||
    mongoose.model("Channel", channelSchema);
export default Channel;
