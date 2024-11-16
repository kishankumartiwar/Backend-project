import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the schema for the User model
const UserSchema = new Schema(
  {
    // Unique username, stored in lowercase for consistency and indexed for faster searches
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    // Email address, unique and stored in lowercase for uniformity
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Full name of the user, indexed for quick lookups
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    // URL of the user's avatar image, typically from a cloud service
    /* avatar: {
      type: String,
      required: true,
    }, */
    // URL of the user's profile cover image, optional
    coverImage: {
      type: String,
    },
    // Array of references to the Video model, representing the user's watch history
    watchHistory: [ 
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    // User's password, required and hashed before storing
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    // Refresh token for generating new access tokens without re-login
    refreshToken: {
      type: String,
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true
  }
);

// Middleware to hash password before saving the user document
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  // Hash the password with a salt round of 10 and replace the plain password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare provided password with hashed password in the database
UserSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to generate JWT access token for the user
UserSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key from environment variable
    {
      expiresIn: ACCESS_TOKEN_EXPIRY // Expiration time from configuration
    }
  );
};

// Method to generate JWT refresh token for the user
UserSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // Secret key for refresh token
    {
      expiresIn: REFRESH_TOKEN_EXPIRY // Expiration time for refresh token
    }
  );
};

// Export the User model to use in other parts of the application
export const user = mongoose.model("user", UserSchema);
