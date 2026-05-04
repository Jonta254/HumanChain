import { put } from "@vercel/blob";
import { NextRequest } from "next/server";
import {
  isRateLimited,
  noStoreJson,
  rateLimitResponse,
} from "@/lib/serverApi";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "post-upload", 12)) {
    return rateLimitResponse();
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message: "Add BLOB_READ_WRITE_TOKEN before durable image uploads.",
    });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return noStoreJson({ error: "Missing image file." }, { status: 400 });
  }

  if (!allowedImageTypes.has(file.type) || file.size > maxImageSize) {
    return noStoreJson(
      { error: "Use a JPG, PNG, or WebP image under 4 MB." },
      { status: 400 },
    );
  }

  const blob = await put(`humanchain/posts/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return noStoreJson({
    ok: true,
    url: blob.url,
    contentType: file.type,
    size: file.size,
  });
}
