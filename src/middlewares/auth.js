import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
const userAuth = async (req, res, next) => {
  try {
    // ✅ Get token from cookies or Authorization header
    const token =
      req.cookies?.token ||
      (req.headers["authorization"] &&
        req.headers["authorization"].split(" ")[1]);

    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized requests! Please Login" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // ✅ Fetch user
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: " + error.message });
  }
};

export default userAuth;
