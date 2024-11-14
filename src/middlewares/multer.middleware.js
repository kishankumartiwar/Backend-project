import multer from "multer";

// Configure storage settings for file uploads using multer
const storage = multer.diskStorage({
  // Set the destination folder where uploaded files will be stored
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Files are stored in the "public/temp" directory
  },
  // Define how the uploaded file should be named
  filename: function (req, file, cb) {
    cb(null, file.originalname); // File name is kept the same as the original name
  }
});

// Export the multer upload instance with the defined storage settings
export const upload = multer({
  storage, // Use the custom storage settings defined above
});
