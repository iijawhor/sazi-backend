# User Search API (Express + MongoDB)

This feature implements a **search API** that allows querying users by multiple fields with **regex matching**, **pagination**, and **input validation**.

---

## ✅ Features

- Search by multiple fields: `firstName`, `lastName`, `email`, `phoneNumber`
- Case-insensitive search using `$regex` and `$options: "i"`
- Input validation for query length (minimum 3 characters)
- Pagination using `page` and `limit` query params
- Performance optimization:
  - `select()` → return only required fields
  - `lean()` → converts Mongoose documents to plain JS objects
- Consistent JSON response format with `success`, `message`, and `data`

---

## 📂 Project Structure

src/
├── controllers/
│ └── user.controller.js # searchUser controller
├── helpers/
│ └── searchQuery.js # reusable helper for multi-field search
├── routes/
│ └── user.routes.js # API route for /search
└── app.js # Express app with router mounting

---

## ✅ API Endpoint

**Base URL**:
http://localhost:8000/api/v1/users

**Endpoint**:

---

### ✅ Request Example

GET /api/v1/users/search?query=jawhor&page=1&limit=15

#### **Query Parameters**

| Param | Type   | Required | Default | Description                  |
| ----- | ------ | -------- | ------- | ---------------------------- |
| query | String | ✅ Yes   | —       | Search keyword (min 3 chars) |
| page  | Number | ❌ No    | 1       | Page number for pagination   |
| limit | Number | ❌ No    | 15      | Results per page             |

---

### ✅ Response Example (Success)

```json
{
  "success": true,
  "message": "Found 2 matching users.",
  "data": [
    {
      "firstName": "Jawhor",
      "lastName": "Ali",
      "email": "jawhor@example.com",
      "phoneNumber": "9876543210",
      "role": "student"
    },
    {
      "firstName": "Jawhor",
      "lastName": "Khan",
      "email": "khan@example.com",
      "phoneNumber": "9123456780",
      "role": "teacher"
    }
  ]
}
✅ Response Example (Validation Error)
json
{
  "success": false,
  "message": "Please enter at least 3 characters to search."
}
✅ Response Example (Server Error)
json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Error details"
}
✅ Controller: searchUser
javascript
const searchUser = async (req, res) => {
  const { query, page = 1, limit = 15 } = req.query;

  if (!query || query.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Please enter at least 3 characters to search."
    });
  }

  try {
    const result = await searchQuery(
      User,
      query,
      ["firstName", "lastName", "email", "phoneNumber"],
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: result.length
        ? `Found ${result.length} matching users.`
        : "No users found matching your search.",
      data: result
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
✅ Helper: searchQuery
javascript
export const searchQuery = async (
  model,
  query,
  fieldsArray,
  page = 1,
  limit = 15
) => {
  if (!query || query.length < 3) {
    return [];
  }

  const skip = (page - 1) * limit;

  const searchConditions = fieldsArray.map((field) => ({
    [field]: { $regex: query, $options: "i" }
  }));

  const results = await model
    .find({ $or: searchConditions })
    .select("firstName lastName email phoneNumber role")
    .skip(skip)
    .limit(limit)
    .lean();

  return results;
};
✅ Router
javascript
import { searchUser } from "../controllers/user.controller.js";
import { Router } from "express";

const router = Router();

router.route("/search").get(searchUser);

export default router;
✅ How They Work Together
Client sends GET request with query, page, and limit.

searchUser validates query and calls searchQuery.

searchQuery:

Creates dynamic $or conditions for all fields.

Runs MongoDB query with $regex for case-insensitive matching.

Applies skip and limit for pagination.

Controller sends JSON response with success, message, and data.
🔍 Example MongoDB Query
If query = "jawhor":

{
  $or: [
    { firstName: { $regex: "jawhor", $options: "i" } },
    { lastName: { $regex: "jawhor", $options: "i" } },
    { email: { $regex: "jawhor", $options: "i" } },
    { phoneNumber: { $regex: "jawhor", $options: "i" } }
  ]
}
✅ Performance Tips
Add indexes on fields:
UserSchema.index({ firstName: 1, lastName: 1, email: 1, phoneNumber: 1 });
For full-text search on large datasets, use MongoDB text indexes or Elasticsearch.

 Future Enhancements
Add sorting by name or date.

Return totalCount for frontend pagination UI.

Add caching for frequent queries.

```

✅ How to Test
Start the server:

bash

npm run dev
http://localhost:8000/api/v1/users/search?query=jawhor
