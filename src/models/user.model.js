import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please enter your fullname"],
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, "Please enter your fullname"],
      trim: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    experties: {
      type: String,
      trim: true,
      index: true,
      // required: [true, "Please enter your experties"],
    },
    experience: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String, //cloudinary
      required: [true, "Avatar is required!"],
    },
    coverImage: {
      type: String, //cloudinary
    },

    assignmentHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccesstoken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshtoken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);
