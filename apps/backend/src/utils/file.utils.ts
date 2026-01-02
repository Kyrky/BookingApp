import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads");

export function deleteImageFile(imageUrl: string | null): void {
  if (!imageUrl) return;

  const filename = extractFilename(imageUrl);
  if (!filename) return;

  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function extractFilename(imageUrl: string): string | null {
  if (!imageUrl) return null;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    const urlParts = imageUrl.split("/uploads/");
    return urlParts[1] || null;
  }

  if (imageUrl.startsWith("/uploads/")) {
    return imageUrl.replace("/uploads/", "");
  }

  return imageUrl;
}
