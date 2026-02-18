"use server";

import { v2 as cloudinary } from "cloudinary";

// Use "export async function" exactly like this
export async function getCloudinarySignature(folder: string = "vendor-docs") {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary configuration missing");
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return { 
      success: true,
      signature, 
      timestamp, 
      cloudName,
      apiKey,
      folder
    };
  } catch (error: any) {
    console.error("SIGNATURE_ERROR:", error);
    return { success: false, error: error.message };
  }
}