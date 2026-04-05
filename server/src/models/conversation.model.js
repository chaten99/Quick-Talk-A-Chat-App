import mongoose from "mongoose";

const schema = new mongoose.Schema({
    is_group: {
        type: Boolean,
        default: false,
    },
    is_direct: {
        type: Boolean,
    },
    group_name: {
        type: String,
    },
    group_avatar: {
        type: String,
        default: ""
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    last_message_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    }
}, {timestamps: true});

export default mongoose.model("Conversation", schema);