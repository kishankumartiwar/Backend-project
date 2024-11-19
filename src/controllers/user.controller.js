import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { user as UserModel } from "../models/user.model.js"; // Importing the user model and renaming it for clarity
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Cloudinary utility to upload files
import { ApiResponse } from "../utils/ApiResponse.js"; // Utility to structure API responses
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';


// Function to generate access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user by ID
    const user = await UserModel.findById(userId);
    console.log("User fetched: ", user); // Log user data to check if it's fetched properly
    // Generate tokens
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Save without running validations again

    return { accessToken, refreshToken }; // Return the tokens
  } 
  catch (error) {
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
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  // Ensure the avatar upload was successful
  if (!avatar) {
    throw new ApiError(400, "Error uploading avatar");
  }

  // Create a new user in the database
  const newUser = await UserModel.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password, // Password should be hashed within the model
    avatar: avatar.url,
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
  const user = await UserModel.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  // Verify the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // Fetch the logged-in user details excluding sensitive fields
  const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken");

  // Options for secure cookies
  const options = {
    httpOnly: true, // Accessible only by the server
   // secure: true, // Requires HTTPS
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
  // Ensure the user is authenticated
 /*  if (!req.User || !req.User._id) {
    return res.status(400).json({ message: "No user authenticated" });
  } */
 
  // Remove the refresh token from the user's record
  await UserModel.findByIdAndUpdate(
    req.User._id,
    { $set: { refreshToken: undefined } }, // Remove refreshToken field
    { new: true }
  );

  // Options for clearing cookies
  const options = {
    httpOnly: true,
    secure: true // Ensure it's true in production
  };

  // Clear cookies and send response
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const User = await user.findById(decodedToken?._id);
    if (!User) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== User?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(User._id);

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
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const{oldPassword , newPassword} = req.body  
 const User = await user.findById(req.User?._id)
 const isPasswordCorrect = await User.isPasswordCorrect(oldPassword)
 if(!isPasswordCorrect){
  throw new ApiError(400 , "Inavalid password entered")
 }
 User.password = newPassword
 await User.save({validateBeforeSave:false})
 return res
 .status()
 .json(new ApiResponse(200,{},"password saved succesfully"))



})

const getCurrentUser = asyncHandler(async(req,res) =>{
  return res
  .status(200)
  .json(new ApiResponse (200,req.User,"current user fetched succesfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email} = req.body 

  if(!fullname || !email){
    throw new ApiError(400,"All fields are required")
  }

  const User = await user.findByIdAndUpdate(
    req.User?._id,
    {
      $set:{
        fullname,
        email : email,

      }
    },
    {new:true}).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,{},"account details update succesfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=> {
  const avatarLocalPath = req.file?.path
  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400, "Error while uploading on avatar")  
  }
  const User = await user.findByIdAndUpdate(
    req.User?._id,
    {
      $set :{
        avatar : avatar.url
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,User, "avatar image updated succesfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res)=> {
  const coverImgageLocalPath = req.file?.path
  if(!coverImgageLocalPath){
    throw new ApiError(400, "coverimage file is missing")
  }
  const coverImage = await uploadOnCloudinary(coverImgageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400, "Error while uploading on coverimage")  
  }
  const User = await user.findByIdAndUpdate(
    req.User?._id,
    {
      $set :{
        coverImage : coverImage.url
      }
    },
    {new:true}
  ).select("-password")


  return res
  .status(200)
  .json(new ApiResponse(200,User, "cover image updated succesfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const{username} = req.params
  if(!username?.trim()){
    throw new ApiError(400,"username missing")
  }
  console.log("req.user._id:", req.User._id); // Check the value

  const channel = await UserModel.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "Subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: { $ifNull: ["$Subscribers", []] },
        },
        channelsSubscribedToCount: {
          $size: { $ifNull: ["$subscribedTo", []] },
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.User._id, "$Subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  


  if(!channel?.length){
    throw new ApiError(404,"channel doesnt exist")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],"user channel fetched succesfully")
  )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
  const User = await UserModel.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.User._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    },
  ])
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      User[0].watchHistory,
      "watch history fetched "
    )
  )
})
// Exporting the controller functions
export {   
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
