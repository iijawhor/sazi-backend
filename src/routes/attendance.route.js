import { Router } from "express";
import userAuth from "../middlewares/auth.js";
import { handleAttendance } from "../controllers/attendance.controller.js";
const router = Router();
router.route("/attendance").post(userAuth, handleAttendance);
export default router;
