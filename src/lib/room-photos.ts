import fs from "node:fs";
import path from "node:path";

/** Optional real photos for the framed pictures (checked at build time, server only). */
export interface RoomPhotos {
  usa: string | null;
  india: string | null;
}

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function find(name: string): string | null {
  for (const ext of EXTENSIONS) {
    const rel = `images/room/${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return `/${rel}`;
  }
  return null;
}

/** Drop `public/images/room/usa.jpg` or `india.jpg` in to replace the illustrated scenes. */
export function getRoomPhotos(): RoomPhotos {
  return { usa: find("usa"), india: find("india") };
}
