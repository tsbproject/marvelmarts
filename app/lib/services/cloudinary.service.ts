import {
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


  
}