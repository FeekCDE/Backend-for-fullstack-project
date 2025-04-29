const { Server } = require("socket.io");
const socketHandlers = require("./handlers");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173/",
        methods: ['GET', 'POST']
     } // Consider restricting this in production
  });

  // Handle connections
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Initialize all socket event handlers
    socketHandlers(io, socket);
  });

  return io;
};

module.exports = { initializeSocket };