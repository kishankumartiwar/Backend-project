import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Establish database connection and start the server
connectDB()
  .then(() => {
    // If database connection is successful, start the server on the specified port
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    // Log an error message if the database connection fails
    console.error("MongoDB connection failed:", err);
  });

/* 
First approach to connect to the database:

This approach uses an IIFE (Immediately Invoked Function Expression) with async/await
to establish a MongoDB connection before starting the server. The app listens for errors
and logs them if any occur.

import mongoose, { connect } from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express;

(async () => {
  try {
    // Connect to MongoDB with the URI from environment variables
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("Error:", error);
      throw error;
    });

    // Start server on specified port
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("ERROR", error);
  }
})();
*/
