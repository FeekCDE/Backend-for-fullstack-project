const express = require("express");
const http = require("http");
const connectDB = require("./database");
const app = express();
const server = http.createServer(app);
const { initializeSocket } = require("./Socket/index");
const cors = require("cors");
const port = process.env.PORT || 3000;

// Routes
const dashboardRoute = require("./Routes/dashboard.routes");
const userRoute = require("./Routes/user.routes");
const postRoute = require("./Routes/posts.routes");
const { verifyUser } = require("./middlewares/authentication");
const authRoute = require("./ForgotPassword")

// Database connection
connectDB();

// Middlewares
require('./cloudinary'); 
app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", dashboardRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/auth", authRoute)

// Initialize Socket.IO with authentication middleware
const { io } = initializeSocket(server);

// Optional: Add socket.io instance to app locals if needed elsewhere
app.locals.io = io;

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

// Error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});