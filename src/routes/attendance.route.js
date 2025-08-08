import { Router } from "express";
import userAuth from "../middlewares/auth.js";
import {
  getAllAttendance,
  handleAttendance
} from "../controllers/attendance.controller.js";
const router = Router();
router.route("/attendance").post(userAuth, handleAttendance);
router.route("/get-attendance/:id").get(userAuth, getAllAttendance);
export default router;
