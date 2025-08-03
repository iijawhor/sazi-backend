import { registerUser, login } from "../controllers/user.controller.js";
import { Router } from "express";
const router = Router();
router.route("/register").post(registerUser);
router.route("/login").post(login);
export default router;
