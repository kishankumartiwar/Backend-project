import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Configure CORS to allow requests from specified origin and enable credentials
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Set allowed origin from environment variable
  credentials: true                // Enable cookies and other credentials in requests
}));

// Configure middleware for parsing JSON and URL-encoded data with size limits
app.use(express.json({ limit: "16kb" }));         // Parse JSON payloads with a 16kb limit
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded payloads with a 16kb limit

// Serve static files from the "public" directory
app.use(express.static("public"));

// Enable parsing of cookies in request headers
app.use(cookieParser());

// Export the configured Express app for use in other modules

//routes
import userRouter from "./routes/user.routes.js"

//routes declaration

app.use("/api/v1/users" , userRouter)












export { app };
