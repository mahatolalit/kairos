import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/user.model.js";

// Load environment variables
dotenv.config();

const seedUsers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    console.log("Hashing default password '123456'...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    console.log("Generating 100 test users...");
    const usersToInsert = [];
    for (let i = 1; i <= 100; i++) {
      usersToInsert.push({
        email: `user${i}@kairos.com`,
        fullName: `Test User ${i}`,
        password: hashedPassword,
        profilePic: "",
      });
    }

    console.log("Inserting users into database...");
    // Use unordered insert to ignore duplicate keys if users already exist
    await User.insertMany(usersToInsert, { ordered: false });
    
    console.log("Successfully seeded 100 users!");
  } catch (error) {
    if (error.code === 11000) {
      console.log("Seeding completed. Some users already existed (duplicate emails skipped).");
    } else {
      console.error("Error seeding users:", error.message);
    }
  } finally {
    console.log("Disconnecting from MongoDB...");
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedUsers();
