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
    is_edited: {
        type: Boolean,
        default: false,
    },
    attachment: {
        url: {
            type: String,
        },
        public_id: {
            type: String,
        },
        file_name: {
            type: String,
        },
        mime_type: {
            type: String,
        },
        size: {
            type: Number,
        },
        kind: {
            type: String,
            enum: ["image", "video", "pdf"],
        },
        resource_type: {
            type: String,
            enum: ["image", "video", "raw"],
        },
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
