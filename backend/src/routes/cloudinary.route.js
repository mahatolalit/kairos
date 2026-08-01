import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/sign",protectRoute, async (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      timestamp,
      folder: "chat-images",
    };
    if (process.env.CLOUDINARY_UPLOAD_PRESET) {
      paramsToSign.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
      folder: "chat-images",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not generate Cloudinary signature" });
  }
});

export default router;
