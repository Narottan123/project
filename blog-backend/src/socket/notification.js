import { Server } from "socket.io";

const notificationIo = {
  io: new Server(),
};

const connectedUsers = new Map();

notificationIo.io.on("connection", (socket) => {
  console.log("[Socket.io] Client connected:", socket.id);

  // Authenticated user registers their userId
  socket.on("register_user", (userId) => {
    if (userId) {
      connectedUsers.set(userId.toString(), socket.id);
      socket.userId = userId;
      console.log(`[Socket.io] User ${userId} mapped to socket ${socket.id}`);
    }
  });

  // Client joins a specific post room for live comment streaming
  socket.on("join_post", (postId) => {
    if (postId) {
      socket.join(`post_${postId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room post_${postId}`);
    }
  });

  socket.on("leave_post", (postId) => {
    if (postId) {
      socket.leave(`post_${postId}`);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId.toString());
    }
    console.log("[Socket.io] Client disconnected:", socket.id);
  });
});

/**
 * Send real-time notification to a specific user
 */
notificationIo.sendNotificationToUser = (userId, data) => {
  if (!userId) return;
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    notificationIo.io.to(socketId).emit("user_notification", data);
  }
};

/**
 * Broadcast event to all clients
 */
notificationIo.broadcast = (event, data) => {
  notificationIo.io.emit(event, data);
};

export default notificationIo;
