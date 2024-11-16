import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,       // Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET  // Cloudinary API secret
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // Check if the local file path is provided
    if (!localFilePath) return null;

    // Upload the file to Cloudinary, setting resource type to "auto" for any file type
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // Log the URL of the successfully uploaded file
    console.log("File uploaded successfully:", response.url);
    fs.unlinkSync(localFilePath)
    return response; // Return Cloudinary response, including the file URL
  } catch (error) {
    // If upload fails, remove the locally saved temporary file
    fs.unlinkSync(localFilePath);
    console.error("File upload failed:", error);
  }
};

// Export the function for use in other parts of the application
export { uploadOnCloudinary };
