import fs from "fs";
import path from "path";
import { prisma } from "@repo/database";

const uploadsDir = path.join(process.cwd(), "uploads");

export async function cleanupOrphanedImages(): Promise<{ deleted: number; errors: string[] }> {
  const errors: string[] = [];
  let deleted = 0;

  if (!fs.existsSync(uploadsDir)) {
    return { deleted: 0, errors: [] };
  }

  const files = fs.readdirSync(uploadsDir);
  const properties = await prisma.property.findMany({
    select: { imageUrl: true },
  });

  const usedImageUrls = new Set(
    properties
      .map((p) => p.imageUrl)
      .filter((url): url is string => url !== null)
      .map((url) => {
        if (url.startsWith("/uploads/")) {
          return url.replace("/uploads/", "");
        }
        if (url.startsWith("http://") || url.startsWith("https://")) {
          const parts = url.split("/uploads/");
          return parts[1] || "";
        }
        return url;
      })
  );

  for (const file of files) {
    if (!usedImageUrls.has(file)) {
      try {
        fs.unlinkSync(path.join(uploadsDir, file));
        deleted++;
      } catch (err) {
        errors.push(`Failed to delete ${file}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
  }

  return { deleted, errors };
}
