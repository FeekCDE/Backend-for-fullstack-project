const {User} = require("../Models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { sendMail } = require("../Mail")
require("dotenv").config()
const Post = require("../Models/post.model")

const handleLogin = async (req, res)=>{
   const {username, password} = req.body
   try{
    const user = await User.findOne({username}).select("+password")
    if(user){
        const validPassword = await bcrypt.compare(password, user.password)
        if(validPassword){
            const token = jwt.sign(
                {_id: user._id, email: user.email},
                process.env.JWT_SECRET,
                {expiresIn:"200min"}
            )

            res.json({
                token,
                message: "Login Succesfull"
            }).status(200)
        }else{
            res.json({
                message:"Password incorrect"
            }).status(401)
        }
    }else{
        res.json({
            message: "Account not found"
        }).status(404);
    }
   }
   catch(err){
    console.log(err)
   }
}

// const getUserProfile= async(userId)=> {
//     const [user, posts] = await Promise.all([
//       User.findById(req.user._id).select('username profilePicture'),
//       Post.find(req.user._id).sort({ createdAt: -1 }).limit(10).lean()
//     ]);
// }

const handleProfileView = async (req,res)=>{
    const [user, posts] = await Promise.all([
        User.findById(req.user._id).select('username joinedOn firstname lastname'),
        Post.find({userId:req.user._id}).sort({ createdAt: -1 }).limit(10).lean()
      ]);
    // const {_id} = req.user;
	// const user = await User.findById(_id);
    // getUserProfile()

	res.json({
		success: true,
		data: {user,posts},
		message: "User data fetched"
	})
}

const handleRegistration = async (req, res) => {
    console.log(req.body)
    const { firstname, lastname, username, dateOfBirth, email, password } = req.body;

    
    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });
        if (existingUser || existingUsername) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }else{
            const userData = {
                firstname,
                lastname,
                username,
                dateOfBirth,
                email,
                password,
            };

            // Create the user
    
            const newUser = await User.create(userData);
    
            // Send welcome email
            const response = await sendMail(
                [newUser.email],
                "Welcome to Our Site!",
                `<p>Hello ${newUser.firstname}, you are welcome to this site</p> <h3>Yooooooo!</h3>`
            );
    
            if (!response.success) {
                console.log("Email Error:", response.error);
            }
    
            res.status(201).json({
                message: "User Registration Successful",
                data: newUser,
            });
    
            console.log("User Registration Completed");
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }

};

const handleProfilePictureUpdate = async (req,res)=>{
    try{
        const imageUrl = req.file.path;
        user = await Post.findByIdAndUpdate(
            req.user._id,
            {profilePicture: imageUrl},
            {new: true}
        )
        res.json({ success: true, message: "Profile picture updated!", user });
    } catch{
        res.status(500).json({ success: false, message: "Upload failed", error });    }
}

module.exports ={handleLogin, handleProfileView, handleRegistration, handleProfilePictureUpdate }