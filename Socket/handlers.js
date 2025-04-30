const groups = new Map();
const groupMessages = new Map();
const userGroups = new Map();
const connectedUsers = new Map();
const {User} = require("../Models/user.model");

// Helper functions
const getUnreadCount = (userId, groupId) => {
  const userGroupList = userGroups.get(userId) || [];
  const group = userGroupList.find(g => g.id === groupId);
  return group?.unread || 0;
};

const sendUserGroups = (socket) => {
  try {
    const groupsList = Array.from(groups.values())
      .filter(group => group.members.includes(socket.user._id))
      .map(group => ({
        ...group,
        unread: getUnreadCount(socket.user._id, group.id)
      }));
    
    socket.emit('userGroups', groupsList);
  } catch (error) {
    console.error("Error sending user groups:", error);
  }
};

const safeCallback = (callback, response) => {
  if (typeof callback === 'function') {
    callback(response);
  }
};

module.exports = (io, socket) => {
  // Authentication handler
  socket.on('authenticate', async (token, callback) => {
    try {
      if (!token) {
        return safeCallback(callback, { success: false, error: "Authentication failed" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id).select('-password');

      socket.user = user;
      socket.username = user.username || `User-${user._id.toString().slice(0, 4)}`;

      connectedUsers.set(user._id.toString(), {
        socketId: socket.id,
        username: socket.username
      });

      console.log(`User authenticated: ${socket.username} (${user._id})`);
      safeCallback(callback, { success: true });
      sendUserGroups(socket);
    } catch (error) {
      console.error("Authentication error:", error);
      safeCallback(callback, { success: false, error: "Authentication failed" });
    }
  });

  // Create group handler
  socket.on('createGroup', async (groupData, callback) => {
    try {
      if (!socket.user?._id) {
        return safeCallback(callback, { success: false, error: "Not authenticated" });
      }

      if (!groupData.name?.trim()) {
        return safeCallback(callback, { success: false, error: "Group name is required" });
      }

      const groupId = Date.now().toString();
      const newGroup = {
        id: groupId,
        name: groupData.name,
        members: [socket.user._id],
        admin: socket.user._id,
        createdAt: new Date().toISOString(),
        lastMessage: null
      };

      groups.set(groupId, newGroup);
      groupMessages.set(groupId, []);

      if (!userGroups.has(socket.user._id)) {
        userGroups.set(socket.user._id, []);
      }
      userGroups.get(socket.user._id).push({
        ...newGroup,
        unread: 0
      });

      await socket.join(groupId);

      safeCallback(callback, { success: true, group: newGroup });
      socket.emit('groupCreated', newGroup);
      sendUserGroups(socket);
    } catch (error) {
      console.error("Group creation error:", error);
      safeCallback(callback, { success: false, error: "Failed to create group" });
    }
  });

  // Join group handler
  socket.on('joinGroup', ({ groupId }, callback) => {
    try {
      if (!socket.user?._id) {
        return safeCallback(callback, { success: false, error: "Not authenticated" });
      }

      const group = groups.get(groupId);
      if (!group) {
        return safeCallback(callback, { success: false, error: "Group not found" });
      }

      // Add user to group members if not already a member
      if (!group.members.includes(socket.user._id)) {
        group.members.push(socket.user._id);
        groups.set(groupId, group);
      }

      // Add to user's groups
      if (!userGroups.has(socket.user._id)) {
        userGroups.set(socket.user._id, []);
      }
      
      const userGroupList = userGroups.get(socket.user._id);
      const existingGroupIndex = userGroupList.findIndex(g => g.id === groupId);
      
      if (existingGroupIndex === -1) {
        userGroupList.push({
          ...group,
          unread: 0
        });
      }

      // Join the group room
      socket.join(groupId);

      // Get group messages
      const messages = groupMessages.get(groupId) || [];

      safeCallback(callback, {
        success: true,
        group: { ...group, unread: 0 },
        messages: messages.map(msg => ({
          ...msg,
          senderName: connectedUsers.get(msg.senderId)?.username || msg.senderName
        }))
      });

      console.log(`User ${socket.username} joined group ${groupId}`);
    } catch (error) {
      console.error("Group join error:", error);
      safeCallback(callback, { success: false, error: "Failed to join group" });
    }
  });

  // Get group messages
  socket.on('getGroupMessages', ({ groupId }, callback) => {
    try {
      if (!socket.user?._id) {
        return safeCallback(callback, { success: false, error: "Not authenticated" });
      }

      const group = groups.get(groupId);
      if (!group || !group.members.includes(socket.user._id)) {
        return safeCallback(callback, { success: false, error: "Not a group member" });
      }

      const messages = (groupMessages.get(groupId) || []).map(msg => ({
        ...msg,
        senderName: connectedUsers.get(msg.senderId)?.username || msg.senderName
      }));

      safeCallback(callback, { success: true, messages });
    } catch (error) {
      console.error("Get messages error:", error);
      safeCallback(callback, { success: false, error: "Failed to get messages" });
    }
  });

  // Group message handler
  socket.on('groupMessage', (messageData, callback) => {
    try {
      if (!socket.user?._id) {
        return safeCallback(callback, { success: false, error: "Not authenticated" });
      }

      const { groupId, text } = messageData;

      if (!groupId || !text?.trim()) {
        return safeCallback(callback, { success: false, error: "Missing required fields" });
      }

      const group = groups.get(groupId);
      if (!group || !group.members.includes(socket.user._id)) {
        return safeCallback(callback, { success: false, error: "Not a group member" });
      }

      const message = {
        id: Date.now().toString(),
        senderId: socket.user._id,
        senderName: socket.username,
        text,
        timestamp: new Date().toISOString(),
        groupId,
      };

      // Store message
      const messages = groupMessages.get(groupId) || [];
      messages.push(message);
      groupMessages.set(groupId, messages);

      // Update group last message
      group.lastMessage = text;
      groups.set(groupId, group);

      // Broadcast to group with sender name
      io.to(groupId).emit('newGroupMessage', {
        ...message,
        senderName: socket.username
      });

      // Update unread counts for all members except sender
      group.members.forEach(memberId => {
        if (memberId.toString() !== socket.user._id.toString()) {
          const memberGroupList = userGroups.get(memberId) || [];
          const groupIndex = memberGroupList.findIndex(g => g.id === groupId);
          
          if (groupIndex !== -1) {
            memberGroupList[groupIndex].unread = (memberGroupList[groupIndex].unread || 0) + 1;
            memberGroupList[groupIndex].lastMessage = text;
            
            // Notify the member
            io.to(connectedUsers.get(memberId)?.socketId).emit('groupUpdated', memberGroupList[groupIndex]);
          }
        }
      });

      safeCallback(callback, { success: true, message });
    } catch (error) {
      console.error("Group message error:", error);
      safeCallback(callback, { success: false, error: "Failed to send message" });
    }
  });

  // Mark as read handler
  socket.on('markAsRead', ({ groupId }, callback) => {
    try {
      if (!socket.user?._id) {
        return safeCallback(callback, { success: false });
      }

      const memberGroupList = userGroups.get(socket.user._id) || [];
      const groupIndex = memberGroupList.findIndex(g => g.id === groupId);

      if (groupIndex !== -1) {
        memberGroupList[groupIndex].unread = 0;
        socket.emit('groupUpdated', memberGroupList[groupIndex]);
      }

      safeCallback(callback, { success: true });
    } catch (error) {
      console.error("Mark as read error:", error);
      safeCallback(callback, { success: false });
    }
  });

  // Get user groups
  socket.on('getUserGroups', (data, callback) => {
    try {
      if (!socket.user?._id) {
        return safeCallback(callback, { success: false, error: "Not authenticated" });
      }
      sendUserGroups(socket);
      safeCallback(callback, { success: true });
    } catch (error) {
      console.error("Get user groups error:", error);
      safeCallback(callback, { success: false, error: "Failed to get groups" });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (socket.user?._id) {
      connectedUsers.delete(socket.user._id);
    }
  });
};