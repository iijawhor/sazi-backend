User Model (Mongoose)
This model defines the User schema for the School Management System, handling different roles: admin, teacher, and student.

Features
Role-based user management (admin, teacher, student)

Email validation using validator

Strong password validation

Phone number format validation (10 digits)

Password hashing using bcrypt before saving

Role-based cleanup: grade and assignedClasses only for students

Timestamps (createdAt, updatedAt)
Schema Structure
Field Type Description
fullName String Required, user's full name
email String Required, unique, validated as email
password String Required, strong password validation
phoneNumber String Required, 10-digit format
role String Enum: admin, teacher, student
grade ObjectId Ref to Grade model (students only)
assignedClasses ObjectId Ref to Grade model (students only)
joiningDate Date Required
about String Optional, max length 80 chars

Password Hashing
Implemented using bcrypt with 10 salt rounds.

Uses isModified("password") to prevent rehashing when other fields are updated.

Implementation
javascript
Copy
Edit
userSchema.pre("save", async function (next) {
if (this.isModified("password")) {
this.password = await bcrypt.hash(this.password, 10);
}
next();
});
Usage
Create a new user (password auto-hashed):

javascript
Copy
Edit
const user = new User({
fullName: "John Doe",
email: "john@example.com",
password: "StrongPass@123",
role: "student"
});
await user.save();
✅ Next Steps:

Implement login API using JWT and bcrypt.compare for password validation.

Add role-based access control for different dashboards (admin, teacher, student).

<!-- REGISTER USER API -->

User Registration API
This feature allows users to register with secure password hashing and JWT-based authentication.

📌 Endpoint
bash
Copy
Edit
POST /api/v1/users/register
✅ Request Body
Send JSON payload:
json
{
"firstName": "John",
"lastName": "Doe",
"email": "john.doe@example.com",
"password": "StrongPass@123",
"phoneNumber": "9876543210"
}
✅ Features
Field Validation: All fields are required (firstName, lastName, email, password, phoneNumber).

Email Uniqueness: Duplicate email registrations are not allowed.

Password Security: Passwords are hashed using bcrypt before saving.

JWT Authentication: A JWT token is generated for the user after registration and stored in cookies.

Sensitive Data Protection: Password is excluded from response.

✅ Successful Response
json

{
"success": true,
"message": "User registered successfully",
"newUser": {
"\_id": "64e123abcde4567890fgh123",
"firstName": "John",
"lastName": "Doe",
"email": "john.doe@example.com",
"phoneNumber": "9876543210",
"role": "student",
"createdAt": "2025-07-27T12:34:56.789Z"
}
}
✅ Error Responses
400: Missing fields → "error": "All fields are required"

409: Email already exists → "error": "User with this email already exists"

✅ Tech Stack
Express.js for API

MongoDB & Mongoose for database

bcrypt for password hashing

jsonwebtoken (JWT) for authentication

cookie-parser for token handling in cookies
