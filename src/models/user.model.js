import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid Email Address"]
    },
    password: {
      type: String,
      required: true,
      validate: [validator.isStrongPassword, "Enter a strong password"]
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^\d{10}$/.test(value),
        message: "Phone number must be 10 digits"
      }
    },
    class: { type: String, default: "" },
    joiningDate: { type: Date, default: Date.now },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student"
    },
    age: { type: String, default: "" },
    gender: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    about: { type: String, maxLength: 80, default: "" },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      default: null
    },
    assignedClasses: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      default: null
    }
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Generate JWT
userSchema.methods.getJWT = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET || "dev@akdjo834", {
    expiresIn: "3d"
  });
};

// ✅ Validate password
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// ✅ Remove grade for non-students
userSchema.pre("save", function (next) {
  if (this.role !== "student") {
    this.grade = undefined;
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
