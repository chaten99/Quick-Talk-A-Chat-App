import mongoose from "mongoose";

const schema = new mongoose.Schema({
    message_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    seen_at: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.model("MessageSeen", schema);