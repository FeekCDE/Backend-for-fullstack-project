// routes/posts.js
const { verifyUser } = require("../middlewares/authentication");
const express = require('express');
const upload = require("../cloudinary");
const { handlePostCreation } = require("../Controllers/post.controller");
const router = express.Router();


router.get('/', verifyUser,)
router.post('/createpost', verifyUser, upload.single('media'), handlePostCreation);

module.exports = router;