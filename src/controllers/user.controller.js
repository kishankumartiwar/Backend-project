import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user as UserModel } from "../models/user.model.js"; // Importing the user model and renaming it for clarity
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Cloudinary utility to upload files
import { ApiResponse } from "../utils/ApiResponse.js"; // Utility to structure API responses

// Function to generate access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);
    
    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Save without running validations again

    return { accessToken, refreshToken }; // Return the tokens
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
}

// Function to handle user registration
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Ensure all required fields are provided
  if ([fullname, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if a user with the same username or email already exists
  const existingUser = await UserModel.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // Handle avatar file upload from the request
  const avatarLocalPath = req.files?.avatar?.[0]?.path; // Avatar file path
  let coverImageLocalPath;

  // Check if a cover image file is provided
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Avatar is required; throw an error if missing
  /* if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  } */

  // Upload avatar and cover image to Cloudinary
  /* const avatar = await uploadOnCloudinary(avatarLocalPath); */
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  // Ensure the avatar upload was successful
/*   if (!avatar) {
    throw new ApiError(400, "Error uploading avatar");
  }
 */
  // Create a new user in the database
  const newUser = await UserModel.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password, // Password should be hashed within the model
   /*  avatar: avatar.url, */
    coverImage: coverImage?.url || "",
  });

  // Fetch the created user excluding sensitive fields
  const createdUser = await UserModel.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // Respond with a success message and the created user details
  res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));
});

// Function to handle user login
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Ensure username or email is provided
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // Find the user by username or email
  const User = await UserModel.findOne({
    $or: [{ username }, { email }],
  });

  if (!User) {
    throw new ApiError(404, "User doesn't exist");
  }

  // Verify the password
  const isPasswordValid = await User.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(User._id);

  // Fetch the logged-in user details excluding sensitive fields
  const loggedInUser = await UserModel.findById(User._id).select("-password -refreshToken");

  // Options for secure cookies
  const options = {
    httpOnly: true, // Accessible only by the server
    secure: true, // Requires HTTPS
  };

  // Send response with cookies and user data
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
    );
});

// Function to handle user logout
const logoutUser = asyncHandler(async (req, res) => {
  // Remove the refresh token from the user's record
  await UserModel.findByIdAndUpdate(
    req.User._id, // User ID from request
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  // Clear cookies for access and refresh tokens
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Exporting the controller functions
export {
  registerUser,
  loginUser,
  logoutUser,
};
