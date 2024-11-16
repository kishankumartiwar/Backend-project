import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { user } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from cookies or authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    
    // If no token is found, throw an unauthorized error
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    // Verify the token using the secret key from environment variables
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 

    // Find the user based on the decoded token's _id and exclude password and refreshToken from the result
    const User = await user.findById(decodedToken?._id).select("-password -refreshToken");
    
    // If user is not found, throw an error indicating invalid access token
    if (!User) {
      throw new ApiError(401, "Invalid access token");
    }
    // Attach the user data to the request object for further use in other middleware or routes
    req.User = User;

    next();
  } catch (error) {
    // If any error occurs during the token verification process, throw an unauthorized error
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
