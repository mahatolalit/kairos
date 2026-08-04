import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? process.env.CLIENT_URL || true 
      : ["http://localhost:5173", "http://localhost:5001"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  if (!userId) return null;
  return userSocketMap[userId.toString()];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.use((socket, next) => {
  try {
    const cookieString = socket.request.headers.cookie;
    if (!cookieString) return next(new Error("Authentication error: No cookies"));

    const cookies = cookieString.split(";").reduce((acc, current) => {
      const [key, value] = current.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies.jwt;
    if (!token) return next(new Error("Authentication error: No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) return next(new Error("Authentication error: Invalid token"));

    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.userId;
  if (userId) {
    userSocketMap[userId.toString()] = socket.id;

    // Automatically mark pending messages as delivered when a user connects
    (async () => {
      try {
        const senders = await Message.distinct("senderId", { receiverId: userId, isDelivered: false });
        if (senders.length > 0) {
          await Message.updateMany(
            { receiverId: userId, isDelivered: false },
            { $set: { isDelivered: true } }
          );
          senders.forEach((senderId) => {
            const senderSocketId = userSocketMap[senderId.toString()];
            if (senderSocketId) {
              io.to(senderSocketId).emit("messagesDelivered", { receiverId: userId });
            }
          });
        }
      } catch (error) {
        console.error("Error updating message delivery status:", error);
      }
    })();
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId && userSocketMap[userId.toString()] === socket.id) {
      delete userSocketMap[userId.toString()];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };