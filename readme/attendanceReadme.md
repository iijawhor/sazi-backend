✅ README (Updates & In-Depth Explanation for Attendance Feature)
New Feature: Attendance Management

1. Purpose
   This feature allows authenticated users (admin, teacher, student) to mark their attendance by logging in or out. The system ensures:

Users cannot log in multiple times on the same day.

Users cannot log out without logging in first.

Tracks login and logout timestamps for each user.

2. Attendance Workflow
   API Endpoint:

POST /api/v1/attendance/attendance
Authentication Required: Yes (JWT Token via Authorization header or cookies).

3. Models
   Attendance Schema
   File: models/attendance.model.js

const attendanceSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
date: { type: String, required: true }, // Format: YYYY-MM-DD
loggedInAt: { type: String }, // Format: HH:mm:ss
loggedOutAt: { type: String }, // Format: HH:mm:ss
status: { type: String, enum: ["in", "out"], default: "Not In" }
}); 4. Controller Logic
File: controllers/attendance.controller.js

handleAttendance(req, res)
Extracts status from request body ("in" or "out").

Validates the status value.

Gets userId from req.user (decoded from JWT by userAuth middleware).

Uses date in YYYY-MM-DD format for daily tracking.

Logic Flow:

If status === "in":

Checks if the user has already logged in today.

Creates a new record with loggedInAt timestamp.

If status === "out":

Ensures user has logged in before logging out.

Updates record with loggedOutAt timestamp.

5. Routes
   File: routes/attendance.route.js

import { Router } from "express";
import userAuth from "../middlewares/auth.js";
import { handleAttendance } from "../controllers/attendance.controller.js";

const router = Router();
router.route("/attendance").post(userAuth, handleAttendance);

export default router; 6. Middleware
File: middlewares/auth.js

Verifies JWT token from:

Authorization header → Bearer <token>

or req.cookies.token

Decodes token using process.env.ACCESS_TOKEN_SECRET.

Attaches user object (req.user) to the request.

7. Postman Usage
   Authorization:

Select Bearer Token.

Paste the JWT token from /login response.

Body:

Set type to raw → JSON.

Example:
{ "status": "in" }
For logout:

{ "status": "out" } 8. Sample Responses
✅ Login Success:

{
"message": "Login successful",
"attendance": {
"\_id": "66b1d8f4b9df22",
"userId": "688f56f0b853996eaaa9ac02",
"date": "2025-08-03",
"loggedInAt": "14:32:01",
"status": "in"
}
}
✅ Logout Success:

{
"message": "Logout successful",
"attendance": {
"\_id": "66b1d8f4b9df22",
"userId": "688f56f0b853996eaaa9ac02",
"date": "2025-08-03",
"loggedInAt": "14:32:01",
"loggedOutAt": "16:15:09",
"status": "out"
}
}
❌ Already Logged In:

{ "message": "Already logged in today" }
❌ Invalid Status:

{ "message": "Invalid status" } 9. Key Points
Security: JWT-based authentication for every attendance action.

Validation: Prevents duplicate logins and logouts.

Scalability: Can easily extend to track multiple sessions or shifts.
