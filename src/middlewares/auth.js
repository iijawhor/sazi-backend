import jwt from "jsonwebtoken";
import { User } from "../allFiles.js";
const userAuth = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login");
    }
    const decoddedObject = await jwt.verify(token, "jak@sazi26462");
    const { _id } = decoddedObject;
    const user = await User.findById({ _id });
    if (!user) {
      throw new Error("User not found!");
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized : " + error.message });
  }
};
export default userAuth;
