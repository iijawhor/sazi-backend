import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccesstoken();
    const refreshToken = user.generateRefreshtoken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validate user data - not empty,correct format
  // check if user already exist :email
  // check for images ,check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refreshtoken field from reponse
  // check for user creation
  // return response
  const { fullname, username, password, email } = req.body;
  console.log("email... ", email);

  if (
    [fullname, username, email, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username is already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImgLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImgLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImgLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  // get data from req.body
  // username || email is present or not
  // find the user
  // is user present - check passsword
  // if password is coreect --//access & refresh token
  // send cookie
  // return response

  const { username, email, password } = req.body;
  console.log(username, email, password);
  // if (!username || !email) {
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required!");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "User donesn't exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  const option = {
    httpOnnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, refreshToken, accessToken },
        "User logged in successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauhtorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnnly: true,
      secure: true,
    };

    const { newRefreshToken, accessToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// update user methods
// change password
const updateUserPassword = asyncHandler(async (req, res) => {
  // get the data from body
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // find the user
  const user = await User.findById(req.user?._id);
  // check new password are matched or not
  if (!(newPassword === confirmPassword)) {
    throw new ApiError(400, "New password and confirmation do not match");
  }
  if (newPassword === oldPassword) {
    throw new ApiError(400, "New password cannot be the same as the old one");
  }
  // check oldPassword id not correct or not
  const isPasswordCorrrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrrect) {
    throw new ApiError(401, "Old password is incorrect");
  }
  // if the password are correct then save the user with new password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});
// fetch the current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});

const deleteOldImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { avatar } = user;
  const imageUrl = avatar?.url;
  if (!user || !imageUrl) {
    throw new ApiError(400, "user or avatar not found");
  }

  const publicId = imageUrl.split("/").pop().split(".")[0];
  await deleteFromCloudinary(publicId);
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Image deleted successfully from Cloudinary")
    );
});

// change account details
const updateUserAccountDetails = asyncHandler(async (req, res) => {
  // get the details you want to update

  const { username, fullname, email, experties } = req.body;
  // find the user and save
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username,
        fullname,
        email,
        experties,
      },
    },
    { new: true }
  ).select("-password");
  // return the respo nse to frontend
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account updated successfullly"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // get the file path -
  const avatarLocalFilePath = req.file?.path;
  // check is filepath present or not
  if (!avatarLocalFilePath) {
    throw new ApiError(400, "Avatar file path doesn't exist");
  }
  // upload it on cloudoinary
  const avatar = await uploadOnCloudinary(avatarLocalFilePath);
  if (!avatar.url) {
    throw new ApiError(400, "Avatar image doesn't exist");
  }
  // const find the user and update the avatar
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar image updated successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, body) => {
  // get the file path -
  const coverImageLocalFilePath = req.file?.path;
  // check is filepath present or not
  if (!coverImageLocalFilePath) {
    throw new ApiError(400, "Avatar file path doesn't exist");
  }
  // upload it on cloudoinary
  const coverImage = await uploadOnCloudinary(avatarLocalFilePath);
  if (!coverImage.url) {
    throw new ApiError(400, "Cover image doesn't exist");
  }
  // const find the user and update the avatar
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
// get user assignments
const getAllAssignments = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { userId, role } = req.user;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const assignments = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.user?._id) } },
    {
      $lookup: {
        from: "assignments",
        localField: "assignmentHistory",
        foreignField: "_id",
        as: "assignmentHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              ownerDetails: {
                $first: "$ownerDetails",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignments[0].assignmentHistory,
        "Assignment fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserPassword,
  updateUserAccountDetails,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  deleteOldImage,
  getAllAssignments,
};
