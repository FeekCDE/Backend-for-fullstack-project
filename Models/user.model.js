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
    }
    
})

userSchema.pre("save", async function () {
	const {password} = this;
	try {
		const salt = await bcrypt.genSalt();
		this.password = await bcrypt.hash(password, salt);
	} catch (error) {
		console.log(error);
	}
})

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
 