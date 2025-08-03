import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  loggedInAt: { type: String }, // HH:mm:ss
  loggedOutAt: { type: String },
  status: { type: String, enum: ["in", "out"], default: "Not In" }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
