const Post = require("../Models/post.model");
const {User} = require("../Models/user.model");
const path = require('path');
const fs = require('fs');

const handlePostCreation = async (req, res) => {
    try {
        // Validate request
        if (!req.file) {
          return res.status(400).json({ 
            success: false,
            error: 'No media file uploaded' 
          });
        }
    
        if (!req.body.caption || req.body.caption.trim() === '') {
          // Remove the uploaded file if caption is invalid
          fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
          return res.status(400).json({
            success: false,
            error: 'Caption is required'
          });
        }
    
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
          return res.status(400).json({
            success: false,
            error: 'Invalid file type. Only images (JPEG, PNG, GIF) and MP4 videos are allowed'
          });
        }

        user = await User.findById(req.user._id) //finds the user who made the request
        
        // Create post object with additional metadata
        const newPost ={
          userId: user._id,
          username: user.username,
          caption: req.body.caption.trim(),
          mediaUrl: `/uploads/${req.file.filename}`,
          mediaType: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
          createdAt: new Date(),
          updatedAt: new Date()
        };
    
        
        // Log success (consider using a proper logger in production)
        console.log('New post created:', {
            postId: newPost._id,
            userId: newPost.userId,
            mediaType: newPost.mediaType
        });
        
        // Successful response
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: newPost
        });

        // Here you would typically save to database
        const savedPost = await Post.create(newPost);
        console.log(savedPost)
        
      } catch (error) {
        console.error('Error creating post:', error);
        
        // Clean up uploaded file if error occurred after upload
        if (req.file && fs.existsSync(path.join(__dirname, '../uploads', req.file.filename))) {
          fs.unlinkSync(path.join(__dirname, '../uploads', req.file.filename));
        }
    
        res.status(500).json({
          success: false,
          error: 'Failed to create post',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
      }
}

module.exports = {handlePostCreation}