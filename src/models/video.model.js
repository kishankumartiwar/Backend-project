import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the schema for the Video model
const videoSchema = new Schema(
  {
    // URL to the video file, stored in a cloud service like Cloudinary
    videoFile: {
      type: String,
      required: true,
    },
    // URL to the video's thumbnail image, also stored in Cloudinary
    thumbnail: {
      type: String,
      required: true,
    },
    // Title of the video, a brief text description
    title: {
      type: String,
      required: true,
    },
    // Detailed description of the video content
    description: {
      type: String,
      required: true,
    },
    // Duration of the video in seconds, typically fetched from Cloudinary metadata
    duration: {
      type: Number,
      required: true,
    },
    // Number of times the video has been viewed, initialized to 0
    views: {
      type: Number,
      default: 0,
    },
    // Boolean flag to determine if the video is published and publicly accessible
    isPublished: {
      type: Boolean,
      default: true,
    },
    // Reference to the User model, indicating the owner of the video
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user"
    }
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true
  }
);

// Apply pagination plugin to allow easy pagination on aggregated queries
videoSchema.plugin(mongooseAggregatePaginate);

// Export the Video model to use in other parts of the application
export const Video = mongoose.model("Video", videoSchema);
