import Attendance from "../models/attendance.model.js";

const handleAttendance = async (req, res) => {
  try {
    const { status } = req.body; // "in" or "out"
    const userId = req.user._id;
    // Validate status
    if (!status || !["in", "out"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // ✅ Get local date in YYYY-MM-DD format (avoids UTC offset issue)
    const today = new Date().toLocaleDateString("en-CA"); // "2025-08-08"

    // ✅ Get local time in HH:mm:ss (avoids 24-hour spillover)
    const currentTime = new Date().toLocaleTimeString("en-GB", {
      hour12: false
    });

    // Find existing record for today
    let attendance = await Attendance.findOne({ userId, date: today });

    if (status === "in") {
      if (attendance) {
        return res.status(400).json({ message: "Already logged in today" });
      }

      // Create new record
      attendance = await Attendance.create({
        userId,
        date: today,
        status,
        loggedInAt: currentTime
      });

      return res.status(200).json({
        message: "Login successful",
        attendance
      });
    }

    if (status === "out") {
      if (!attendance) {
        return res
          .status(400)
          .json({ message: "Cannot logout without logging in first" });
      }

      if (attendance.loggedOutAt) {
        return res.status(400).json({ message: "Already logged out today" });
      }

      // Update record with logout time
      attendance.loggedOutAt = currentTime;
      await attendance.save();

      return res.status(200).json({
        message: "Logout successful",
        attendance
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const getAllAttendance = async (req, res) => {
  const userId = req.params.id;
  try {
    const allAttendance = await Attendance.find({ userId });
    return res.status(200).json({
      message: "Attendance fetched successfully",
      data: allAttendance
    });
  } catch (error) {
    console.log("eeror in BEC to fetch attendacen..", error);

    return res.status(400).json({ message: "Did not get attendance" });
  }
};

export { handleAttendance, getAllAttendance };
