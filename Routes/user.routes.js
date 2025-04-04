const express = require('express');
const { handleLogin, handleProfileView, handleRegistration } = require('../Controllers/user.controller');
const { verifyUser } = require('../middlewares/authentication');
const router = express.Router();

router.post("/login", handleLogin)

router.post("/register", handleRegistration)

router.get("/profile", verifyUser, handleProfileView)
module.exports = router