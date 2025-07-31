import User from "../models/user.model.js";
import { searchQuery } from "./searchHelper.js";
const registerUser = async (req, res) => {
  const { firstName, lastName, phoneNumber, password, email } = req.body;
  try {
    if (
      [firstName, lastName, email, password, phoneNumber].some(
        (filed) => filed?.trim() === ""
      )
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existedUser = await User.findOne({
      $or: [{ email }]
    });
    if (existedUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber
    });
    const token = await user.getJWT();
    const newUser = await User.findById(user._id).select("-password");

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 360000)
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      newUser
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
const searchUser = async (req, res) => {
  const { query, page = 1, limit = 15 } = req.query;

  // ✅ Validate input
  if (!query || query.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Please enter at least 3 characters to search."
    });
  }

  try {
    // ✅ Call reusable helper
    const result = await searchQuery(
      User,
      query,
      ["firstName", "lastName", "email", "phoneNumber"],
      page,
      limit
    );

    // ✅ Send response
    res.status(200).json({
      success: true,
      message:
        result?.length > 0
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

export { registerUser, searchUser };
