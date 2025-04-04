const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Social-project-uploads", // Cloudinary folder
    allowed_formats: ["jpg", "png", "jpeg", "gif", "mp4", "webp"], // Allowed file formats
  },
});

const upload = multer({ storage });

module.exports = upload;
