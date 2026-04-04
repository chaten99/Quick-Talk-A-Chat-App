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