const { Server } = require("socket.io");
const socketHandlers = require("./handlers");
const jwt = require('jsonwebtoken')
const {User} = require('../Models/user.model')

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "https://photogram-ebon.vercel.app", // Must match your frontend URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for Socket.IO
  io.use( async (socket, next) => {
    // Implement your socket authentication logic here
    // Example: verify JWT from handshake/auth
    const token = socket.handshake.auth.token;
    if (token) {
      // Verify token and attach user to socket
      const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = await User.findById(verifiedUser)
      console.log(socket.user)
      // socket.user = decodedUser;
      next();
    } else {
      next(new Error("Authentication error"));
    }
  });

  // Handle connections
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socketHandlers(io, socket);
  });

  return io;
};

module.exports = { initializeSocket };