import User from "../models/user.model.js";
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
export { registerUser };
