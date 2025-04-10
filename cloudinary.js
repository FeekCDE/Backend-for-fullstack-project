const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require("multer");

// Configure Cloudinary (using environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

// Set up Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'Social-project-uploads', // Folder name (same as original)
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'webp'], // Supports webp now
      resource_type: 'auto', // Auto-detect image/video
      transformation: [
        { width: 800, crop: 'limit' }, // Resize images (not applied to videos)
        { quality: 'auto' } // Optimize quality
      ],
      // Optional: Custom public_id (filename) logic
      public_id: req.user ? `user_${req.user.id}_${Date.now()}` : `file_${Date.now()}`
    };
  }
});

// Initialize Multer with the storage engine
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    // Optional: Additional file validation (e.g., block certain file types)
    if (!file.mimetype.match(/^image\/|^video\//)) {
      return cb(new Error('Only images and videos are allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;