const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (you might want to move this to a separate config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Social-project-profile-pictures",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
    resource_type: 'auto',
    transformation: [{ width: 500, height: 500, crop: "limit" }] // Optional: resize images
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/^image\//)) {
    return cb(new Error('Only images are allowed'), false);
  }
  cb(null, true);
};

const uploadProfilePicture = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  fileFilter: fileFilter
});

module.exports = uploadProfilePicture;