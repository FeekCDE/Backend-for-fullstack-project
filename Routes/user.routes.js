const express = require('express');
const { handleLogin, handleProfileView, handleRegistration, handleProfilePictureUpdate } = require('../Controllers/user.controller');
const { verifyUser } = require('../middlewares/authentication');
const uploadProfilePicture = require('../middlewares/upload');
const router = express.Router();
const {User} = require('../Models/user.model')

router.post("/login", handleLogin)

router.post("/register", handleRegistration)

router.get("/profile", verifyUser, handleProfileView)

router.post('/update/profilepicture', verifyUser, uploadProfilePicture.single('profilePicture'), handleProfilePictureUpdate);

router.put('/profile/picture', verifyUser, uploadProfilePicture.single('profilePicture'), async (req, res) => {
    try {
      const userId = req.user._id;
      const profilePicture = req.file.path; // Cloudinary returns the URL in req.file.path
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePicture },
        { new: true }
      );
  
      res.json({
        success: true,
        profilePicture: updatedUser.profilePicture
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
module.exports = router