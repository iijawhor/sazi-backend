import Attendance from "../models/attendance.model.js";

const handleAttendance = async (req, res) => {
  console.log("handleAttendance reached");

  try {
    const { status } = req.body; // "login" or "logout"
    const userId = req.user._id;
    console.log("Status", status);

    // Validate status
    if (!status || !["in", "out"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    // Find existing record for today
    let attendance = await Attendance.findOne({ userId, date: today });

    if (status === "in") {
      if (attendance) {
        return res.status(400).json({ message: "Already logged in today" });
      }

      // Create a new record with login time
      attendance = await Attendance.create({
        userId,
        date: today,
        status: status,
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

      // Update existing record with logout time
      attendance.loggedOutAt = currentTime;
      await attendance.save();

      return res.status(200).json({
        message: "Logout successful",
        attendance
      });
    }
  } catch (error) {
    console.error("error...", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { handleAttendance };
