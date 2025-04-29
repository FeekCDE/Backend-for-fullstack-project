const express = require("express");
const http = require("http");
const connectDB = require("./database");
const app = express();
const server = http.createServer(app);
const { initializeSocket } = require("./Socket/index"); // Changed from direct socket.io require
const router = express.Router();
const { authenticate } = require('./middlewares/auth');
const cors = require("cors");
const port = process.env.PORT || 3000;

// Routes
const dashboardRoute = require("./Routes/dashboard.routes");
const userRoute = require("./Routes/user.routes");
const postRoute = require("./Routes/posts.routes");
const { verifyUser } = require("./middlewares/authentication");

// Database connection
connectDB();

// Middlewares
require('./cloudinary'); 
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", dashboardRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);

// Initialize Socket.IO
initializeSocket(server);

// Health check endpoint
app.get('/check', verifyUser, (req, res) => {
  res.status(200).json({ 
    isAuthenticated: !!req.user,
    user: req.user ? {
      _id: req.user._id,
      username: req.user.username,
      profilePicture: req.user.profilePicture
    } : null
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});