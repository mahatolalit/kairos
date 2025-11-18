import "dotenv/config";
import mongoose from "mongoose";
import Message from "../src/models/message.model.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Backfill conversationKey for all existing docs using an update pipeline
    const result = await Message.updateMany(
      {},
      [
        {
          $set: {
            conversationKey: {
              $cond: [
                { $lt: [{ $toString: "$senderId" }, { $toString: "$receiverId" }] },
                { $concat: [{ $toString: "$senderId" }, "_", { $toString: "$receiverId" }] },
                { $concat: [{ $toString: "$receiverId" }, "_", { $toString: "$senderId" }] },
              ],
            },
          },
        },
      ]
    );

    // Ensure indexes exist
    await Message.syncIndexes();

    console.log("Backfill complete:", result?.modifiedCount ?? result);
  } catch (e) {
    console.error("Backfill error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

run();
