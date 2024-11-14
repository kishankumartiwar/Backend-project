import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Asynchronous function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB with the URI from environment variables and the database name
    const connectionInstance = await mongoose.connect(`${process.env.MONGOOSE_URI}/${DB_NAME}`);

    // Log a success message with the host information if connection is successful
    console.log(`MongoDB connected! Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    // Log any connection error that occurs and terminate the process
    console.log("MongoDB connection error:", error);
    process.exit(1); // Exit the application if connection fails
  }
};

// Export the connectDB function for use in other modules
export default connectDB;
