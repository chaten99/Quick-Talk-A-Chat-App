import mongoose from "mongoose";

const schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        enum: ["friend_request", "friend_accepted", "friend_rejected", "message", "conversation"],
    },
    content: {
        type: String,
    },
    reference_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

schema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model("Notification", schema);