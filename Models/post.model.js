const mongoose = require("mongoose");

const postSchema = {
  postContent: {
    type: String, 
    required:true
},
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
}, // Reference User
  createdAt: { 
    type: Date, 
    default: Date.now 
},
};
const Post = mongoose.model("Post", postSchema);
module.exports = {Post}
