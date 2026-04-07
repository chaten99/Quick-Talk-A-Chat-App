import User from "../models/user.model.js";

export const findByEmail = (email) => {
    return User.findOne({ email });
};

export const createUser = (userData) => {
    const user = new User(userData);
    return user.save();
};

export const findById = (id) => {
    return User.findById(id);
};

export const updatePassword = (email, hashedPassword) => {
    return User.findOneAndUpdate({ email }, { password: hashedPassword }, { returnDocument: "after" });
};

export const findByGoogleId = (googleId) => {
    return User.findOne({ googleId });
};

export const findOrCreateGoogleUser = async ({ googleId, email, username, avatar }) => {
    const existingUser = await User.findOne({ googleId });
    if (existingUser) return existingUser;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        existingEmail.googleId = googleId;
        existingEmail.authProvider = "google";
        if (!existingEmail.avatar && avatar) existingEmail.avatar = avatar;
        return existingEmail.save();
    }

    const user = new User({
        googleId,
        email,
        username,
        avatar,
        authProvider: "google",
    });
    return user.save();
};

export const searchUsers = (query, currentUserId, page = 1, limit = 20) => {
    const regex = new RegExp(query, "i");
    return User.find({
        _id: { $ne: currentUserId },
        $or: [
            { username: regex },
            { email: regex },
            { phone: regex }
        ]
    }).select("username email avatar phone")
        .skip((page - 1) * limit)
        .limit(limit + 1);
};

export const setOnlineStatus = (userId, isOnline) => {
    const update = { is_online: isOnline, last_seen: new Date() };
    return User.findByIdAndUpdate(userId, update, { returnDocument: "after" });
};

export const getFriendsIds = async (userId) => {
    const user = await User.findById(userId).select("friends");
    return user?.friends?.map((f) => f.toString()) || [];
};

export const updateProfile = (userId, data) => {
    return User.findByIdAndUpdate(userId, data, { returnDocument: "after" });
};
