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

//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
/* import playlistRouter from "./routes/playlist.routes.js"
 */import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
/* app.use("/api/v1/playlist", playlistRouter)
 */app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register

export { app }