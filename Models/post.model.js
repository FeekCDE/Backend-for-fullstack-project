const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: [true, 'User ID is required']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [2200, 'Caption cannot exceed 2200 characters'], // Instagram-like limit
    default: ''
  },
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required'],
    validate: {
      validator: (url) => {
        // Basic URL validation (adjust as needed for Cloudinary paths)
        return url.startsWith('/uploads/') || url.startsWith('https://res.cloudinary.com/');
      },
      message: 'Invalid media URL format'
    }
  },
  path:{
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    required: true,
    enum: ['image', 'video'], // Only allow these values
    validate: {
      validator: (type) => ['image', 'video'].includes(type),
      message: 'Media type must be either "image" or "video"'
    }
  },
  likes: {
    type: [{
      userId:{type: Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  comments: {
    type: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, trim: true, maxlength: 500 },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // Prevents modification after creation
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` timestamp before saving
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for faster queries
postSchema.index({ userId: 1 }); // Optimize user-specific post fetches
postSchema.index({ createdAt: -1 }); // Optimize sorting by newest posts

const Post = mongoose.model('Post', postSchema);
module.exports = Post;