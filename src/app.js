import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
const upload = multer();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
    credentials: true
  })
);
app.use(upload.none()); // Parse form-data without files
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use((err, req, res, next) => {
  console.error(err); // Log the actual error

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});
import userRouter from "./routes/user.route.js";
import searchRouter from "./routes/search.route.js";
import attendanceRouter from "./routes/attendance.route.js";
app.use("/api/v1/users/", userRouter);
app.use("/api/v1/users/", searchRouter);
app.use("/api/v1/attendance/", attendanceRouter);
export { app };
