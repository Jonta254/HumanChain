import { put } from "@vercel/blob";
import { NextRequest } from "next/server";
import {
  isRateLimited,
  noStoreJson,
  rateLimitResponse,
} from "@/lib/serverApi";

const allowedMediaTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const maxMediaSize = 10 * 1024 * 1024;

function safeMediaName(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : "";
  const baseName = parts
    .join(".")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `${baseName || "moment"}${extension}`;
}

export async function POST(req: NextRequest) {
  if (isRateLimited(req, "post-upload", 12)) {
    return rateLimitResponse();
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "Media uploads are being finalized. Try a text action or listing draft for now.",
    });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return noStoreJson({ error: "Missing media file." }, { status: 400 });
  }

  if (!allowedMediaTypes.has(file.type) || file.size > maxMediaSize) {
    return noStoreJson(
      { error: "Use a JPG, PNG, or WebP image under 10 MB.", errorState: "upload_type_not_allowed" },
      { status: 400 },
    );
  }

  const dayPath = new Date().toISOString().slice(0, 10);
  const blob = await put(`humanchain/posts/${dayPath}/${safeMediaName(file.name)}`, file, {
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
