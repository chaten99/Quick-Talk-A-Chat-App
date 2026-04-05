import mongoose from "mongoose";

const schema = new mongoose.Schema({
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
    },
    unread_count: {
        type: Number,
        default: 0,
    },
    joined_at: {
        type: Date,
        default: Date.now,
    },
    left_at: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

export default mongoose.model("ConversationMember", schema);