import {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/app/lib/cloudinary";

export class CloudinaryService {
  static async upload(
    file: File,
    folder = "uploads"
  ) {
    return uploadToCloudinary(file, folder);
  }

  static async uploadMany(
    files: File[],
    folder = "uploads"
  ) {
    const urls: string[] = [];

    for (const file of files) {
      urls.push(await this.upload(file, folder));
    }

    return urls;
  }

  static async delete(
    url: string
  ) {
    return deleteFromCloudinary(url);
  }

  static async deleteMany(
    urls: string[]
  ) {
    if (!urls.length) return;

    await Promise.allSettled(
      urls.map((url) => this.delete(url))
    );
  }

  static async replace(
    oldUrls: string[],
    newFiles: File[],
    folder = "uploads"
  ) {
    await this.deleteMany(oldUrls);

    return this.uploadMany(
      newFiles,
      folder
    );
  }


  static async getUploadSignature(
  folder = "vendor-docs"
) {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim();

  const apiKey =
    process.env.CLOUDINARY_API_KEY?.trim();

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET?.trim();

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret
  ) {
    throw new Error(
      "Cloudinary configuration missing."
    );
  }

 

  const timestamp = Math.round(
    Date.now() / 1000
  );

  const signature =
    cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      apiSecret
    );

  return {
    success: true,
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder,
  };
}
}