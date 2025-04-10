const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;  // Note the .v2 here

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Social-project-profile-pictures", // Cloudinary folder
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"], // Allowed file formats
    resource_type: 'auto',

  },
});

const uploadProfilePicture = multer({ 
  storage,
  limits:{fileSize: 1024 * 1024 * 5}, // 5MB
  fileFilter: (req,res,cb)=>{
    if(!file.mimtype.match('/^image\/')){
      return cb(new Error('Only images are allowed'), (false));
    }
    cb(null,true)
  }
 });

module.exports = uploadProfilePicture;
