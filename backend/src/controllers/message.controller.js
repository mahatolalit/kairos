import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Optional keyset pagination
    const limit = Math.min(Number(req.query.limit) || 0, 200); // 0 = no limit (return all)
    const beforeId = req.query.beforeId; // Message _id string for older pages

    // Build stable conversation key
    const a = String(myId);
    const b = String(userToChatId);
    const conversationKey = a < b ? `${a}_${b}` : `${b}_${a}`;

    const filter = { conversationKey };
    if (beforeId) filter._id = { $lt: beforeId };

    let query = Message.find(filter);
    if (limit > 0) query = query.sort({ _id: -1 }).limit(limit);

    // Narrow projection and lean to avoid hydration overhead
    const projection = "senderId receiverId text image createdAt";
    let messages = await query.select(projection).lean();

    // Fallback to legacy $or path if no docs (pre-backfill safety)
    if ((!messages || messages.length === 0) && !beforeId) {
      const legacyFilter = {
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      };
      let legacyQuery = Message.find(legacyFilter);
      if (limit > 0) legacyQuery = legacyQuery.sort({ _id: -1 }).limit(limit);
      messages = await legacyQuery.select(projection).lean();
    }

    // If paginating newest-first, return chronological order for the UI
    if (limit > 0) messages = messages.slice().reverse();

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        text: newMessage.text,
        image: newMessage.image,
        createdAt: newMessage.createdAt,
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};