const {User} = require("../Models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { sendMail } = require("../Mail")
require("dotenv").config()

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
                {expiresIn:"10min"}
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

const handleProfileView = async (req,res)=>{
    const {_id} = req.user;
	const user = await User.findById(_id);
	res.json({
		success: true,
		data: user,
		message: "User data fetched"
	})
}

const handleRegistration = async (req, res) => {
    console.log(req.body)
    const { firstname, lastname, username, dateOfBirth, email, password } = req.body;

    
    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create the user
        const userData = {
            firstname,
            lastname,
            username,
            dateOfBirth,
            email,
            password,
        };

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
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports ={handleLogin, handleProfileView, handleRegistration }