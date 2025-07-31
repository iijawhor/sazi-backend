import { searchUser } from "../controllers/user.controller.js";
import { Router } from "express";
const router = Router();
router.route("/search").get(searchUser);
export default router;
