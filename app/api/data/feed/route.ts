import { list } from "@vercel/blob";
import { NextRequest } from "next/server";
import {
  isRateLimited,
  noStoreJson,
  rateLimitResponse,
} from "@/lib/serverApi";

type FeedKind = "post" | "marketplace-listing" | "story";

type StoredReceipt = {
  data?: unknown;
  id?: number | string;
  kind?: FeedKind;
  savedAt?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function isPublicPost(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.author === "string" &&
    typeof value.caption === "string" &&
    typeof value.image === "string"
  );
}

function isPublicMarketplaceListing(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.seller === "string" &&
    typeof value.title === "string" &&
    typeof value.price === "string" &&
    Array.isArray(value.photos)
  );
}

function isPublicStory(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.author === "string" &&
    typeof value.title === "string" &&
    typeof value.text === "string" &&
    (value.kind === "file" || value.kind === "micro")
  );
}

function isPublicRecord(kind: FeedKind, value: unknown) {
  if (kind === "post") {
    return isPublicPost(value);
  }

  if (kind === "marketplace-listing") {
    return isPublicMarketplaceListing(value);
  }

  return isPublicStory(value);
}

async function readFeedKind(kind: FeedKind) {
  const result = await list({
    limit: 48,
    prefix: `humanchain/data/${kind}/`,
  });
  const blobs = result.blobs
    .sort(
      (first, second) =>
        new Date(String(second.uploadedAt)).getTime() -
        new Date(String(first.uploadedAt)).getTime(),
    )
    .slice(0, 24);
  const records = await Promise.all(
    blobs.map(async (blob) => {
      try {
        const response = await fetch(blob.url, {
          cache: "no-store",
        });

        if (!response.ok) {
          return null;
        }

        const parsed = (await response.json()) as StoredReceipt;

        if (!isPublicRecord(kind, parsed.data)) {
          return null;
        }

        return {
          ...(parsed.data as Record<string, unknown>),
          dataReceiptUrl: blob.url,
          dataStorageStatus: kind === "marketplace-listing" ? "cloud-safe" : undefined,
          savedAt: parsed.savedAt ?? String(blob.uploadedAt),
          storageStatus: kind !== "marketplace-listing" ? "cloud-safe" : undefined,
        };
      } catch {
        return null;
      }
    }),
  );

  return records.filter(Boolean);
}

async function readFeedKindSafely(kind: FeedKind) {
  try {
    return {
      error: null,
      kind,
      records: await readFeedKind(kind),
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown Blob read error";

    return {
      error: `${kind} feed temporarily unavailable: ${detail}`,
      kind,
      records: [],
    };
  }
}

export async function GET(req: NextRequest) {
  if (isRateLimited(req, "public-feed", 60)) {
    return rateLimitResponse();
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return noStoreJson({
      ok: false,
      pendingSetup: true,
      message:
        "The shared feed is being finalized. Starter content remains available.",
    });
  }

  const [posts, marketplaceListings, stories] = await Promise.all([
    readFeedKindSafely("post"),
    readFeedKindSafely("marketplace-listing"),
    readFeedKindSafely("story"),
  ]);
  const warnings = [posts.error, marketplaceListings.error, stories.error].filter(Boolean);

  return noStoreJson({
    ok: true,
    blobStorageReady: true,
    checkedAt: new Date().toISOString(),
    marketplaceListings: marketplaceListings.records,
    posts: posts.records,
    stories: stories.records,
    warnings,
  });
}
