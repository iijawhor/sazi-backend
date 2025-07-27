import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter first your name"]
    },
    lastName: {
      type: String,
      required: [true, "Please enter last your name"]
    },
    email: {
      type: String,
      validator(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address" + value);
        }
      },
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, "Please enter email address"]
    },
    password: {
      type: String,
      required: true,
      validator(value) {
        if (!validator.isStrongPassword(value))
          throw new Error(`Enter a Strong password : 324@Jak!`);
      }
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value);
        },
        message: (props) => `Phone number must be 10 digits: ${props.value}`
      },
      required: true
    },
    class: { type: String },
    joiningDate: {
      type: Date,
      required: true
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
const User = mongoose.model("User", userSchema);
userSchema.pre("save", async function (next) {
  const hashedPassword = await hash(this.password, 10);
  this.password = hashedPassword;
  next();
});
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "jak@sazi26462", {
    expiresIn: "3d"
  });
  return token;
};
userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const isPasswordValid = await bcrypt.compare(password, this.password);
  return isPasswordValid;
};
userSchema.pre("save", function (next) {
  if (this.role !== "student") {
    this.grade = undefined;
    this.section = undefined;
  }
  next();
});

export default User;
