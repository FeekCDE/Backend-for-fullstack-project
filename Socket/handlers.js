// Import any required models or services
// const Message = require('../models/Message');
const groups = [];
module.exports = (io, socket) => {
    // Handle authentication
    socket.on('authenticate', (token) => {
      // Implement your authentication logic here
      // Example: verify JWT and set user data
    });
  
    
    // Handle private messages
    socket.on('privateMessage', async (data) => {
      try {
        const { recipientId, content } = data;
        
        // Validate input
        if (!recipientId || !content) {
          return socket.emit('error', 'Missing required fields');
        }
  
        // Process message (in-memory or database)
        const message = {
          id: Date.now(),
          sender: socket.userId, // Set during authentication
          recipient: recipientId,
          content,
          timestamp: new Date()
        };
  
        // Broadcast to recipient
        socket.to(recipientId).emit('newMessage', message);
        // Send back to sender for UI update
        socket.emit('newMessage', message);
  
      } catch (error) {
        console.error('Error handling private message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });
  
    // Handle group messages
    socket.on('groupMessage', async (data) => {
      // Similar structure to privateMessage but for groups
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Clean up any user data if needed
    });

    socket.on('createGroup', (groupData, callback) => {
        try {
          if (!groupData.name?.trim()) {
            return callback({ success: false, error: 'Group name is required' });
          }
      
          const newGroup = {
            id: Date.now().toString(),
            name: groupData.name,
            members: [socket.userId], // Automatically add creator as member
            admin: socket.userId,
            createdAt: new Date().toISOString()
          };
      
          // Save group (in memory or database)
          groups.push(newGroup);
          
          // Notify creator
          callback({ success: true, group: newGroup });
          console.lof(newGroup)
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });
  
    // Add more event handlers as needed
  };