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

<!-- TO GET ALL THE ATTENDANCE OF A USER -->

## getAllAttendance Controller & Route

### Purpose

The `getAllAttendance` function is an Express controller that retrieves **all attendance records** for a specific user from the database. It allows the frontend or any API consumer to fetch a user’s complete attendance history.

---

### Function Overview

```js
const getAllAttendance = async (req, res) => {
  const userId = req.params.id;
  try {
    const allAttendance = await Attendance.find({ userId });
    return res.status(200).json({
      message: "Attendance fetched successfully",
      data: allAttendance
    });
  } catch (error) {
    console.log("Error fetching attendance:", error);
    return res.status(400).json({ message: "Did not get attendance" });
  }
};
```

- **Input:**
  - `req.params.id` — the user’s unique identifier (userId) passed as a route parameter.

- **Process:**
  - Queries the `Attendance` collection to find all records matching the given `userId`.

- **Output:**
  - On success, returns HTTP status `200` with JSON containing all attendance records for that user.
  - On failure, logs the error and returns status `400` with an error message.

---

### API Route

To expose this controller function, a route like the following is typically added:

```js
import express from "express";
import { getAllAttendance } from "../controllers/attendance.controller.js";

const router = express.Router();

router.get("/attendance/get-attendance/:id", getAllAttendance);

export default router;
```

- **HTTP Method:** `GET`
- **Endpoint:** `/attendance/get-attendance/:id`
- **Route Parameter:** `id` — the user’s ID to fetch attendance for.

---

### Usage

- The frontend calls this endpoint with the user’s ID to fetch their attendance records, for example:

```
GET /attendance/get-attendance/64f76a4f12345abcde6789f0
```

- The API responds with a JSON payload:

```json
{
  "message": "Attendance fetched successfully",
  "data": [
    {
      "_id": "64f7701a12345abcde6789f1",
      "userId": "64f76a4f12345abcde6789f0",
      "date": "2025-08-08",
      "status": "in",
      "loggedInAt": "09:00:00",
      "loggedOutAt": "17:30:00"
    },
    ...
  ]
}
```

---

### Error Handling

- If an error occurs during database query, the API responds with:

```json
{
  "message": "Did not get attendance"
}
```

- HTTP status code: `400`

---

### Notes

- Make sure that the user ID passed is valid and that authentication/authorization is handled elsewhere in your app to secure this endpoint.
- This function assumes a MongoDB `Attendance` model exists with fields such as `userId`, `date`, `loggedInAt`, and `loggedOutAt`.
