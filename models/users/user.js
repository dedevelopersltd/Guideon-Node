import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  profilepic: {
    type: String,
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PersonalInfo",
  },
  experiencePoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExperiencePoint",
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  verificationCodeStatus: {
    type: String,
    default: false,
  },
  resetCode: {
    type: String,
  },
  resetCodeStatus: {
    type: Boolean,
    default: false,
  },
  notifications: {
    type: Boolean,
    default: true,
  },
  profileStatus: {
    type: String,
    enum: ["Public", "Private"],
    default: "Public",
  },
  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  ],
  socail: {
    type: Boolean,
    default: false,
  },
  UserChats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
