import mongoose from "mongoose";

const schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["friend_request", "message", "conversation"],
    },
    reference_type: {
        type: String,
        enum: ["friend_request", "message", "conversation"],
    },
    reference_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });


export default mongoose.model("Notification", schema);