import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    // New: stable key for the unordered pair (senderId, receiverId)
    conversationKey: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure conversationKey is always set consistently
messageSchema.pre("validate", function (next) {
  if (!this.senderId || !this.receiverId) return next();
  const a = String(this.senderId);
  const b = String(this.receiverId);
  this.conversationKey = a < b ? `${a}_${b}` : `${b}_${a}`;
  next();
});

// Primary index for fast lookups + keyset pagination by _id desc
messageSchema.index({ conversationKey: 1, _id: -1 });

// Transitional directional indexes to accelerate current $or query branches
messageSchema.index({ senderId: 1, receiverId: 1, _id: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, _id: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;