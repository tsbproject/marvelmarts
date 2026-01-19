import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary using a buffer stream
 */
export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: `marvelmarts/${folder}`,
        resource_type: "auto" 
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url as string);
      }
    ).end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary given its secure_url
 */
export const deleteFromCloudinary = async (url: string) => {
  try {
    // 1. Check if URL is valid
    if (!url || !url.includes("cloudinary")) return;

    // 2. Extract Public ID 
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1/marvelmarts/products/abc.jpg
    // We need: marvelmarts/products/abc
    const parts = url.split("/");
    const marvelIndex = parts.indexOf("marvelmarts");
    if (marvelIndex === -1) return;

    const publicId = parts
      .slice(marvelIndex)
      .join("/")
      .split(".")[0]; // Removes the extension (.jpg, .png)

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
  }
};