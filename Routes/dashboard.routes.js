const express = require('express');
const { displayDashboard} = require('../Controllers/dashboard.controller');
const { verifyUser } = require('../middlewares/authentication');
const router = express.Router()
const upload = require("../cloudinary")

router.get("/", displayDashboard)
router.post("/post", verifyUser, upload.single("file"), async (req, res) => {
    try {
      const { title, description } = req.body;
      const imageUrl = req.file.path; // Cloudinary URL
  
      // Save to MongoDB
      const newPost = new Post({
        title,
        description,
        imageUrl
      });
  
      await newPost.save();
      res.render
      
      res.status(201).json({ success: true, message: "Post created successfully!", data: newPost });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error creating post", error });
    }
});



module.exports = router