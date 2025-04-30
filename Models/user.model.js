const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const userSchema = mongoose.Schema({
    firstname:{
        type: String,
        required: true,
    },
    lastname:{
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    dateOfBirth:{
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },      
    password:{
        type: String,
        select: false,
    },
    joinedOn:{
        type:Date,
        default:Date.now
    },
    isAdmin:{
        type:Boolean
    },
    resetPasswordToken: String,

    resetPasswordExpires: Date
    
})

userSchema.pre('save', async function(next) {
    try {
      // Only hash the password if it has been modified (or is new)
      if (!this.isModified('password')) return next();
  
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      
      // Hash the password with the salt
      const hashedPassword = await bcrypt.hash(this.password, salt);
      
      // Replace the plain text password with the hashed one
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });

userSchema.add({
    followers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    following: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }]
  });

const User = mongoose.model("User", userSchema);
module.exports = {User}
 