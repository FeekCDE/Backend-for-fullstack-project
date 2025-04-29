const { verifyUser } = require("../middlewares/authentication");
const express = require('express');
const upload = require("../cloudinary");
const { handlePostCreation } = require("../Controllers/post.controller");
const router = express.Router();
const mongoose = require("mongoose");
const { getDashboardPosts } = require("../Controllers/dashboard.controller");
const Post = require('../Models/post.model');
const {User} = require('../Models/user.model');

router.get('/', verifyUser, getDashboardPosts);
router.post('/createpost', verifyUser, upload.single('media'), handlePostCreation);

// Like route
router.post('/:id/like', verifyUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(like => like.equals(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter(like => !like.equals(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({
      message: alreadyLiked ? "Like removed" : "Post liked",
      likes: post.likes.length,
      likedBy: post.likes,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Comment routes
router.post('/:id/comment', verifyUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId).select('username profilePicture');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newComment = {
      text: text.trim(),
      userId: user._id,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Return the comment with user details
    const addedComment = {
      ...newComment,
      _id: post.comments[post.comments.length - 1]._id,
      userId: {
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture
      }
    };

    res.status(201).json(addedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:id/comments', verifyUser, async (req, res) => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(postId)
      .populate('comments.userId', 'username profilePicture')
      .select('comments');

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;