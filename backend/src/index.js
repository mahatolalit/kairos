import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

import fs from "fs";

// Load .env from root or backend directory depending on where command is run
if (fs.existsSync(path.resolve("backend/.env"))) {
  dotenv.config({ path: path.resolve("backend/.env") });
} else if (fs.existsSync(path.resolve(".env"))) {
  dotenv.config({ path: path.resolve(".env") });
} else {
  dotenv.config();
}

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5001"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  const distPath = fs.existsSync(path.join(__dirname, "frontend/dist"))
    ? path.join(__dirname, "frontend/dist")
    : path.join(__dirname, "../frontend/dist");

  app.use(express.static(distPath));

  app.get("{*path}", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});