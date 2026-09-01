import { v2 as cloudinary } from "cloudinary";
import { logger } from "@/app/lib/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function validateUploadFile(file: File) {
  if (!file) {
    throw new Error("No file provided.");
  }

  if (file.size <= 0) {
    throw new Error("Uploaded file is empty.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the 10 MB limit.");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type.");
  }
}

/**
 * Uploads a validated file to Cloudinary using a buffer stream.
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string
): Promise<string> => {
  validateUploadFile(file);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `marvelmarts/${folder}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(
            new Error(
              "Cloudinary upload completed without a secure URL."
            )
          );
          return;
        }

        resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

/**
 * Deletes an asset from Cloudinary given its secure URL.
 */
export const deleteFromCloudinary = async (url: string) => {
  try {
    if (!url || !url.includes("cloudinary")) {
      return;
    }

    const parts = url.split("/");
    const marvelIndex = parts.indexOf("marvelmarts");

    if (marvelIndex === -1) {
      return;
    }

    const publicId = parts
      .slice(marvelIndex)
      .join("/")
      .split(".")[0];

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error("CLOUDINARY_DELETE_FAILED", error);
  }
};