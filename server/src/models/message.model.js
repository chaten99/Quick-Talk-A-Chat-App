import mongoose from "mongoose";

const schema = new mongoose.Schema({
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
    },
    message_type: {
        type: String,
        enum: ["text", "file"],
        default: "text",
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
    },
    seen_by: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        seen_at: {
            type: Date,
            default: Date.now,
        }
    }],
}, {timestamps: true});

export default mongoose.model("Message", schema);
