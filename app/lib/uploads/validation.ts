const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateImageFile(
  file: File,
  maxSizeBytes = MAX_IMAGE_SIZE_BYTES
): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }

  if (file.size > maxSizeBytes) {
    return `Image must be smaller than ${Math.round(
      maxSizeBytes / 1024 / 1024
    )}MB.`;
  }

  return null;
}