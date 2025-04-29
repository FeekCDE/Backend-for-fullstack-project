const Post = require('../Models/post.model');
const {User} = require('../Models/user.model');

getDashboardPosts = async (req, res) => {
  try {
    // // Pagination parameters
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const skip = (page - 1) * limit;

    // // Base query for non-deleted posts
    // let query = { isDeleted: false };

    // // If user is logged in, consider post visibility
    // if (req.user) {
    //   query.$or = [
    //     { visibility: 'public' },
    //     { 
    //       visibility: 'followers',
    //       userId: { $in: req.user.following } 
    //     },
    //     { userId: req.user._id } // Always show user's own posts
    //   ];
    // } else {
    //   // For non-logged-in users, only show public posts
    //   query.visibility = 'public';
    // }

    const posts = await Post.find()
      .populate('userId', 'username profilePicture')
      .populate('likes.userId', 'username profilePicture')
      .populate('comments.userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JS objects

    // Transform data for frontend
    const transformedPosts = posts.map(post => {
      const likes = post.likes || [];
      const comments = post.comments || [];
      
      return {
        ...post,
        likeCount: likes.length,
        commentCount: comments.length,
        isLiked: req.user 
          ? likes.some(like => like.userId?._id.equals(req.user._id))
          : false
      };
    });

    // Get total count for pagination
    // const totalPosts = await Post.countDocuments(query);

    res.json({
      success: true,
      posts: transformedPosts,
    //   pagination: {
    //     currentPage: page,
    //     totalPages: Math.ceil(totalPosts / limit),
    //     totalPosts
    //   }
    });
  } catch (err) {
    console.error('Error fetching dashboard posts:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch posts' 
    });
  }
};

// likePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.postId);
//     if (!post) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Post not found' 
//       });
//     }

//     // Check if already liked
//     const likeIndex = post.likes.findIndex(like => 
//       like.userId.equals(req.user._id)
//     );

//     if (likeIndex >= 0) {
//       // Unlike
//       post.likes.splice(likeIndex, 1);
//     } else {
//       // Like
//       post.likes.push({ userId: req.user._id });
//     }

//     await post.save();

//     res.json({
//       success: true,
//       likeCount: post.likes.length,
//       isLiked: likeIndex === -1 // true if now liked, false if unliked
//     });
//   } catch (err) {
//     console.error('Error toggling like:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to toggle like' 
//     });
//   }
// };

viewPost = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(
      req.params.postId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error incrementing view count:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register view' 
    });
  }
};

module.exports = {viewPost, getDashboardPosts}