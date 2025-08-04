import {
  registerUser,
  login,
  getLoggedInUser
} from "../controllers/user.controller.js";
import { Router } from "express";
import userAuth from "../middlewares/auth.js";
const router = Router();
router.route("/signup").post(registerUser);
router.route("/signin").post(login);
router.route("/getLoggedInUser").get(userAuth, getLoggedInUser);
export default router;
