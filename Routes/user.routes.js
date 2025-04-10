const express = require('express');
const { handleLogin, handleProfileView, handleRegistration, handleProfilePictureUpdate } = require('../Controllers/user.controller');
const { verifyUser } = require('../middlewares/authentication');
const uploadProfilePicture = require('../middlewares/upload');
const router = express.Router();

router.post("/login", handleLogin)

router.post("/register", handleRegistration)

router.get("/profile", verifyUser, handleProfileView)

router.get('/update/profilepicture', verifyUser, uploadProfilePicture.single('profilePicture'), handleProfilePictureUpdate)
module.exports = router