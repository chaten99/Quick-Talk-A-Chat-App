import mongoose from "mongoose";

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: ""
    },
    last_seen: {
        type: Date,
        default: Date.now
    },
    is_online: {
        type: Boolean,
    }
}, { timestamps: true });

export default mongoose.model("User", schema);