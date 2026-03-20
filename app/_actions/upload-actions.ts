"use server";

import { v2 as cloudinary } from "cloudinary";

// Use "export async function" exactly like this
export async function getCloudinarySignature(folder: string = "vendor-docs") {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary configuration missing");
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    console.log("SIGN_DEBUG", {
      hasCloudName: !!cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      folder,
      timestamp,
    });

    return {
      success: true,
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    };
  } catch (error: any) {
    console.error("SIGNATURE_ERROR:", error);
    return { success: false, error: error.message };
  }
}