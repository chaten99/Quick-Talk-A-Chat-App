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
  return User.findOneAndUpdate({ email }, { password: hashedPassword });
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