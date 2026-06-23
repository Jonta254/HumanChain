"use client";

import { useEffect, useMemo, useState } from "react";
import { HeartHandshake, PlusCircle, ShieldCheck, Star, Upload, Users } from "lucide-react";
import { Button, Haptic, Spinner, useHaptics } from "@worldcoin/mini-apps-ui-kit-react";
import { getDailyQuestion } from "@/lib/data/dailyQuestions";
import {
  humanChainErrorStates,
  validateAnswerInput,
  validateMomentImage,
} from "@/lib/humanchainPolicy";
import {
  compactStorageArray,
  loadJsonFromStorage,
  saveJsonToStorage,
  storageKeys,
} from "@/lib/humanchain/storage";
import {
  formatCheckInTime,
  formatShortTime,
  getLocalDateKey,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { getChainLinkAuthor } from "@/lib/data/chains";
import { humanHaptic } from "@/lib/world/haptics";
import { TopBar } from "@/components/layout/TopBar";
import type { ChainLink, ChainPremiumState } from "@/types/chain";
import type { HumanPost } from "@/types/content";
import type { HistoryRecord } from "@/types/reputation";
import type { EarnPoints, MomentReactionSelection, OpenPayment } from "@/types/ui";
import type { HumanIdentity } from "@/types/user";

// ---------------------------------------------------------------------------
// Local helpers (only used by ChainsView)
// ---------------------------------------------------------------------------

function getChainLinkPulse(link: ChainLink, index: number) {
  const reactions = link.reactions ?? 6 + ((index + 2) * 3) % 21;
  const createdAt = link.createdAt ?? `${Math.max(2, index + 2)}m ago`;

  return { createdAt, reactions };
}

const chainQuoteLibrary = [
  {
    country: "HumanChain",
    text: "A useful word can travel farther than a loud one.",
  },
  {
    country: "Faith",
    text: "Prayer is not escape; it is how courage learns where to stand.",
  },
  {
    country: "Money",
    text: "Spend slower than your fear and build faster than your excuses.",
  },
  {
    country: "Family",
    text: "Some homes heal when one person chooses a softer sentence.",
  },
  {
    country: "Culture",
    text: "A people are remembered by what they keep teaching their children.",
  },
  {
    country: "Health",
    text: "Healing is not always a comeback. Sometimes it is a new pace.",
  },
  {
    country: "Youth",
    text: "Your future does not need noise. It needs repeated useful action.",
  },
  {
    country: "Work",
    text: "A craft becomes valuable when it can help someone on an ordinary day.",
  },
  {
    country: "Love",
    text: "Love grows where truth can enter without being punished.",
  },
  {
    country: "Purpose",
    text: "Do not wait to feel ready before becoming responsible.",
  },
  {
    country: "World",
    text: "The chain becomes stronger when each human adds one honest link.",
  },
  {
    country: "Wisdom",
    text: "If the lesson cost you pain, let it also pay someone else in guidance.",
  },
  {
    country: "Prayer",
    text: "Faith becomes visible when a worried heart still chooses to ask.",
  },
  {
    country: "Business",
    text: "Your first loyal users are proof that the idea has a pulse.",
  },
  {
    country: "Care",
    text: "Be gentle with people who are learning how to speak after surviving silence.",
  },
  {
    country: "Discipline",
    text: "Small daily order can rescue a life from big repeated confusion.",
  },
  {
    country: "Identity",
    text: "A verified human is not only a user. It is a voice with a life behind it.",
  },
];

const chainFields = [
  {
    name: "Faith & Prayer",
    members: "18.4k",
    mood: "hope",
    detail: "Christians, Hindus, Muslims, Rastafari, and spiritual humans sharing daily strength.",
  },
  {
    name: "Builders & Money",
    members: "31.2k",
    mood: "ambition",
    detail: "Business ideas, WLD use, startup truth, and small wins from verified humans.",
  },
  {
    name: "Love & Family",
    members: "27.8k",
    mood: "care",
    detail: "Relationship wisdom, family repair, parenting, loneliness, and forgiveness.",
  },
  {
    name: "Culture Rooms",
    members: "44.1k",
    mood: "belonging",
    detail: "Language, food, music, migration, identity, and human customs across countries.",
  },
  {
    name: "Health & Healing",
    members: "22.6k",
    mood: "recovery",
    detail: "Daily strength, mental health, caregiving, body changes, and honest survival notes.",
  },
  {
    name: "Migration & Home",
    members: "16.9k",
    mood: "memory",
    detail: "Humans between countries sharing documents, loneliness, hope, work, and belonging.",
  },
  {
    name: "Youth & Future",
    members: "39.7k",
    mood: "future",
    detail: "Young humans asking about skills, identity, ambition, school, pressure, and purpose.",
  },
  {
    name: "Parents & Children",
    members: "20.5k",
    mood: "care",
    detail: "Real lessons from parents, guardians, children, teachers, and family builders.",
  },
];

type ChainField = (typeof chainFields)[number];

const fieldQuoteRooms = {
  "Faith & Prayer": {
    intro: "Bible-rooted strength for prayer, waiting, courage, and quiet faith.",
    quotes: [
      {
        source: "1 Thessalonians 5:17 KJV",
        text: "Pray without ceasing.",
        meaning: "A short verse for keeping the heart connected even in ordinary moments.",
      },
      {
        source: "Philippians 4:6 KJV",
        text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
        meaning: "Bring fear, need, and gratitude into prayer instead of carrying them alone.",
      },
      {
        source: "Psalm 23:1 KJV",
        text: "The Lord is my shepherd; I shall not want.",
        meaning: "Faith can become rest when life feels uncertain.",
      },
      {
        source: "Matthew 7:7 KJV",
        text: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you.",
        meaning: "Prayer is also movement: ask, seek, knock, continue.",
      },
      {
        source: "Isaiah 40:31 KJV",
        text: "They that wait upon the Lord shall renew their strength.",
        meaning: "Waiting can be a place of renewal, not only delay.",
      },
      {
        source: "Psalm 46:10 KJV",
        text: "Be still, and know that I am God.",
        meaning: "Stillness can be an act of trust when pressure is loud.",
      },
      {
        source: "James 5:16 KJV",
        text: "The effectual fervent prayer of a righteous man availeth much.",
        meaning: "Prayer carries power when it is honest, faithful, and persistent.",
      },
      {
        source: "Jeremiah 29:12 KJV",
        text: "Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you.",
        meaning: "Faith believes that prayer is heard, not wasted.",
      },
      {
        source: "Romans 12:12 KJV",
        text: "Rejoicing in hope; patient in tribulation; continuing instant in prayer.",
        meaning: "Prayer gives rhythm to hope, patience, and pressure.",
      },
      {
        source: "Hebrews 11:1 KJV",
        text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
        meaning: "Faith carries what the eyes cannot yet confirm.",
      },
      {
        source: "Psalm 121:2 KJV",
        text: "My help cometh from the Lord, which made heaven and earth.",
        meaning: "Prayer remembers where help begins.",
      },
    ],
  },
  "Builders & Money": {
    intro: "Practical lines for money, discipline, work, and building with patience.",
    quotes: [
      {
        source: "HumanChain Money Room",
        text: "Do not build only for applause; build something that still works when nobody is watching.",
        meaning: "Useful work survives quiet seasons.",
      },
      {
        source: "HumanChain Money Room",
        text: "Money grows faster around clarity than around panic.",
        meaning: "A calm plan beats rushed movement.",
      },
      {
        source: "HumanChain Money Room",
        text: "Profit is good. Trust is what lets profit return.",
        meaning: "Long-term business depends on reputation.",
      },
      {
        source: "HumanChain Money Room",
        text: "The first capital is not money. It is the discipline to keep showing up.",
        meaning: "Consistency gives ideas a chance to become real.",
      },
      {
        source: "HumanChain Money Room",
        text: "Build something people can explain to a friend in one sentence.",
        meaning: "Clear value spreads faster.",
      },
      {
        source: "HumanChain Money Room",
        text: "A small honest sale teaches more than a big imaginary plan.",
        meaning: "Reality is the best business school.",
      },
      {
        source: "HumanChain Money Room",
        text: "Save enough to stay calm, then build enough to stay useful.",
        meaning: "Security and usefulness belong together.",
      },
      {
        source: "HumanChain Money Room",
        text: "A business grows when promises become systems.",
        meaning: "Repeatable trust is stronger than excitement.",
      },
      {
        source: "HumanChain Money Room",
        text: "Do not chase money so fast that wisdom cannot keep up.",
        meaning: "Pace protects judgment.",
      },
    ],
  },
  "Love & Family": {
    intro: "Short wisdom for forgiveness, family repair, patience, and honest love.",
    quotes: [
      {
        source: "HumanChain Family Room",
        text: "A soft answer can save a whole house from becoming a battlefield.",
        meaning: "Tone can protect love when emotions are loud.",
      },
      {
        source: "HumanChain Family Room",
        text: "Children remember the feeling of a room before they understand the reason.",
        meaning: "Presence matters before explanation.",
      },
      {
        source: "HumanChain Family Room",
        text: "Forgiveness is not pretending it did not hurt; it is refusing to let hurt become your language.",
        meaning: "Healing changes how pain speaks through us.",
      },
      {
        source: "HumanChain Family Room",
        text: "Call before pride turns a small distance into a family tradition.",
        meaning: "Repair often starts while the wound is still small.",
      },
      {
        source: "HumanChain Family Room",
        text: "A family does not need perfect people; it needs people willing to return to truth.",
        meaning: "Honesty can rebuild trust slowly.",
      },
      {
        source: "HumanChain Family Room",
        text: "Love is not proven by winning every argument.",
        meaning: "Peace sometimes matters more than being right.",
      },
      {
        source: "HumanChain Family Room",
        text: "The apology that arrives early saves years of translation.",
        meaning: "Quick humility prevents long confusion.",
      },
      {
        source: "HumanChain Family Room",
        text: "A parent can be strong and still say, I am tired.",
        meaning: "Honesty can make care more human.",
      },
      {
        source: "HumanChain Family Room",
        text: "Do not make strangers inherit the kindness your family needed.",
        meaning: "Practice gentleness where it first matters.",
      },
    ],
  },
  "Culture Rooms": {
    intro: "Human customs, migration, food, language, and belonging across countries.",
    quotes: [
      {
        source: "HumanChain Culture Room",
        text: "A language is not only words. It is a map of what a people survived.",
        meaning: "Culture carries memory.",
      },
      {
        source: "HumanChain Culture Room",
        text: "When people share food, strangers begin borrowing each other's peace.",
        meaning: "Small rituals create belonging.",
      },
      {
        source: "HumanChain Culture Room",
        text: "Migration changes the address, but not the need to be known.",
        meaning: "Home is also recognition.",
      },
      {
        source: "HumanChain Culture Room",
        text: "Tradition is a bridge when it helps people cross, not a wall that keeps them small.",
        meaning: "Culture can protect and still grow.",
      },
      {
        source: "HumanChain Culture Room",
        text: "Every country has a song people play when they miss who they were.",
        meaning: "Memory often travels through sound.",
      },
      {
        source: "HumanChain Culture Room",
        text: "Respect begins when curiosity enters before judgment.",
        meaning: "Understanding needs humility.",
      },
      {
        source: "HumanChain Culture Room",
        text: "A custom becomes beautiful when it protects dignity.",
        meaning: "Culture should help people stand taller.",
      },
      {
        source: "HumanChain Culture Room",
        text: "Every accent is proof that a human carried home through distance.",
        meaning: "Language marks survival and belonging.",
      },
      {
        source: "HumanChain Culture Room",
        text: "The world becomes smaller when people explain what matters to them.",
        meaning: "Shared meaning reduces distance.",
      },
    ],
  },
  "Health & Healing": {
    intro: "Words for recovery, mental health, caregiving, and honest survival.",
    quotes: [
      {
        source: "HumanChain Healing Room",
        text: "Rest is not proof you are weak. It is how the body asks to continue.",
        meaning: "Recovery needs respect.",
      },
      {
        source: "HumanChain Healing Room",
        text: "Some wounds close slowly because they are teaching the whole life to move differently.",
        meaning: "Healing can change habits and pace.",
      },
      {
        source: "HumanChain Healing Room",
        text: "Tell one safe person the truth before silence becomes a room.",
        meaning: "Connection can interrupt isolation.",
      },
      {
        source: "HumanChain Healing Room",
        text: "You are allowed to recover without performing strength for everyone.",
        meaning: "Healing does not need to be dramatic to be real.",
      },
      {
        source: "HumanChain Healing Room",
        text: "Some days the victory is not getting better; it is not getting worse alone.",
        meaning: "Small survival still counts.",
      },
      {
        source: "HumanChain Healing Room",
        text: "The body keeps records. Treat it like a witness, not an enemy.",
        meaning: "Care begins with listening.",
      },
      {
        source: "HumanChain Healing Room",
        text: "Healing may be quiet because the deepest repairs do not perform.",
        meaning: "Private progress is still progress.",
      },
      {
        source: "HumanChain Healing Room",
        text: "Ask for help before your strength becomes a disguise.",
        meaning: "Support works best before collapse.",
      },
      {
        source: "HumanChain Healing Room",
        text: "You can be grateful and still need rest.",
        meaning: "Gratitude does not cancel exhaustion.",
      },
    ],
  },
  "Migration & Home": {
    intro: "Words for humans between countries, carrying belonging across distance.",
    quotes: [
      {
        source: "HumanChain Migration Room",
        text: "Home is not always a place. Sometimes it is a language that still remembers you.",
        meaning: "Belonging travels with you.",
      },
      {
        source: "HumanChain Migration Room",
        text: "The hardest border is the one inside the chest when the documents finally clear.",
        meaning: "Legal arrival does not end emotional migration.",
      },
      {
        source: "HumanChain Migration Room",
        text: "Loneliness in a new country is not failure. It is the price of choosing possibility.",
        meaning: "Courage and difficulty arrive together.",
      },
      {
        source: "HumanChain Migration Room",
        text: "The accent you carry is proof that you learned while you moved.",
        meaning: "Growth is visible in how we speak.",
      },
      {
        source: "HumanChain Migration Room",
        text: "Send the money and also send the voice note. Both are home.",
        meaning: "Presence matters as much as provision.",
      },
    ],
  },
  "Youth & Future": {
    intro: "For young humans building identity, skill, faith, ambition, and direction.",
    quotes: [
      {
        source: "HumanChain Youth Room",
        text: "You do not need to become loud to become powerful.",
        meaning: "Quiet discipline can still change a future.",
      },
      {
        source: "HumanChain Youth Room",
        text: "Choose skills that make your future less dependent on permission.",
        meaning: "Learning can become freedom.",
      },
      {
        source: "HumanChain Youth Room",
        text: "Do not confuse being early with being wrong.",
        meaning: "Some good ideas need time to be understood.",
      },
      {
        source: "HumanChain Youth Room",
        text: "Choose friends who make your future easier to respect.",
        meaning: "Your circle shapes your standards.",
      },
      {
        source: "HumanChain Youth Room",
        text: "Confidence grows when promises to yourself stop being broken.",
        meaning: "Self-trust is built in private.",
      },
      {
        source: "HumanChain Youth Room",
        text: "Learn one skill deeply enough that luck can recognize you.",
        meaning: "Preparation makes opportunity useful.",
      },
      {
        source: "HumanChain Youth Room",
        text: "Do not let comparison steal the years meant for practice.",
        meaning: "Growth needs attention more than envy.",
      },
      {
        source: "HumanChain Youth Room",
        text: "Your name becomes stronger when your habits can defend it.",
        meaning: "Reputation is built before it is announced.",
      },
      {
        source: "HumanChain Youth Room",
        text: "A young person with patience is already ahead of noise.",
        meaning: "Steady movement beats restless performance.",
      },
    ],
  },
  "Parents & Children": {
    intro: "Lessons for guardians, children, teachers, family builders, and care.",
    quotes: [
      {
        source: "HumanChain Parents Room",
        text: "A child may forget the advice, but they keep the safety of being listened to.",
        meaning: "Listening becomes a form of love.",
      },
      {
        source: "HumanChain Parents Room",
        text: "Parents also need places where they can be human without losing respect.",
        meaning: "Caregivers need care too.",
      },
      {
        source: "HumanChain Parents Room",
        text: "Teach with patience when possible; fear learns fast but forgets love.",
        meaning: "Correction works best with dignity.",
      },
      {
        source: "HumanChain Parents Room",
        text: "A tired parent still deserves tenderness.",
        meaning: "Caregivers are human before they are roles.",
      },
      {
        source: "HumanChain Parents Room",
        text: "Children need rules, but they also need a place to bring their mistakes.",
        meaning: "Safety makes correction possible.",
      },
      {
        source: "HumanChain Parents Room",
        text: "The best inheritance may be a voice that stays calm in hard moments.",
        meaning: "Emotional safety lasts.",
      },
      {
        source: "HumanChain Parents Room",
        text: "Home should be the first place a child learns repair is possible.",
        meaning: "Family can teach recovery after conflict.",
      },
      {
        source: "HumanChain Parents Room",
        text: "A child grows differently when correction does not remove belonging.",
        meaning: "Discipline should not feel like exile.",
      },
      {
        source: "HumanChain Parents Room",
        text: "The strongest parents keep learning while they lead.",
        meaning: "Authority grows with humility.",
      },
    ],
  },
};

function loadStoredChainPremium(): ChainPremiumState {
  return loadJsonFromStorage<ChainPremiumState>(storageKeys.chainPremium, {
    circleCreated: false,
    pulseUnlocked: false,
  });
}

function scrollMiniAppToTop() {
  if (typeof window === "undefined") {
    return;
  }
  // In World App, html/body overflow is hidden — window.scrollTo is a no-op.
  // Scroll the actual scrollable containers directly.
  window.requestAnimationFrame(() => {
    document.querySelectorAll<HTMLElement>(".phone-frame, .screen").forEach((el) => {
      el.scrollTo({ left: 0, top: 0, behavior: "auto" });
    });
  });
}

async function storeSafeData(
  kind: "post" | "marketplace-listing" | "marketplace-bid" | "payment" | "story",
  id: number | string,
  data: unknown,
) {
  try {
    const response = await fetch("/api/data/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, id, kind }),
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      pendingSetup?: boolean;
      url?: string;
    };

    return {
      ok: Boolean(payload.ok && payload.url),
      pendingSetup: Boolean(payload.pendingSetup),
      url: payload.url,
    };
  } catch {
    return {
      ok: false,
      pendingSetup: false,
      url: undefined,
    };
  }
}

async function prepareMomentImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longestSide = Math.max(bitmap.width, bitmap.height);
    const scale = longestSide > 1440 ? 1440 / longestSide : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.84),
    );

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "") || "moment"}.webp`,
      { type: "image/webp" },
    );
  } catch {
    return file;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChainsView({
  activeField,
  act,
  earnPoints,
  humanIdentity,
  humanPosts,
  keepStreak,
  links,
  openPayment,
  recordHistory,
  setActiveField,
  setHumanPosts,
  setLinks,
}: {
  activeField: ChainField | null;
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  humanIdentity: HumanIdentity | null;
  humanPosts: HumanPost[];
  keepStreak: (detail?: string) => void;
  links: ChainLink[];
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
  setActiveField: React.Dispatch<React.SetStateAction<ChainField | null>>;
  setHumanPosts: React.Dispatch<React.SetStateAction<HumanPost[]>>;
  setLinks: React.Dispatch<React.SetStateAction<ChainLink[]>>;
}) {
  const [linkText, setLinkText] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const { impact } = useHaptics();
  const [postPreview, setPostPreview] = useState<string | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [postMediaType, setPostMediaType] = useState<"image" | "video">("image");
  const [isPublishingPost, setIsPublishingPost] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentSort, setCommentSort] = useState<"relevant" | "newest">("relevant");
  const [chainCommentDrafts, setChainCommentDrafts] = useState<Record<string, string>>({});
  const [chainLinkCommentSort, setChainLinkCommentSort] = useState<"top" | "newest">("top");
  const [activeChainCommentKey, setActiveChainCommentKey] = useState<string | null>(null);
  const [chainComments, setChainComments] = useState<Record<string, string[]>>(() =>
    loadJsonFromStorage<Record<string, string[]>>(storageKeys.chainComments, {}),
  );
  const [momentReactions, setMomentReactions] = useState<Record<string, MomentReactionSelection>>(() =>
    loadJsonFromStorage<Record<string, MomentReactionSelection>>(storageKeys.momentReactions, {}),
  );
  const [chainView, setChainView] = useState<"images" | "quotes" | "groups">(
    "images",
  );
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [activeChainTool, setActiveChainTool] = useState<
    "circle" | "pulse" | "pin" | null
  >(null);
  const [chainPremium, setChainPremium] = useState(loadStoredChainPremium);

  const visiblePosts = humanPosts.filter((post) => Boolean(post.image)).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });
  const visibleLinks = [...links].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });
  const activeCommentPost = activeCommentPostId
    ? visiblePosts.find((post) => post.id === activeCommentPostId) ?? null
    : null;
  const activeComments =
    commentSort === "newest"
      ? [...(activeCommentPost?.comments ?? [])]
      : [...(activeCommentPost?.comments ?? [])].reverse();
  const activeChainCommentEntry = activeChainCommentKey
    ? visibleLinks.find((link, index) => getChainCommentKey(link, index) === activeChainCommentKey)
    : null;
  const activeChainComments = activeChainCommentKey ? chainComments[activeChainCommentKey] ?? [] : [];

  useEffect(() => {
    scrollMiniAppToTop();
  }, [activeField, chainView]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.chainPremium, chainPremium);
  }, [chainPremium]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.chainComments, chainComments);
    compactStorageArray(storageKeys.chainComments, 500);
  }, [chainComments]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.momentReactions, momentReactions);
  }, [momentReactions]);

  function getChainCommentKey(link: ChainLink, index: number) {
    return link.id ? `link:${link.id}` : `seed:${index}:${link.country}:${link.text.slice(0, 48)}`;
  }

  function addLink() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "adding a public moment link")) {
      return;
    }

    const text =
      linkText.trim() || "I am still becoming, and today that is enough.";
    setLinks((current) => [
      {
        createdAt: formatShortTime(new Date()),
        country: humanIdentity?.username ?? "Verified Human",
        id: Date.now(),
        owner: true,
        reactions: 0,
        text,
      },
      ...current,
    ]);
    // Persist moment to Supabase for real feed
    if (humanIdentity?.wallet) {
      void fetch("/api/db/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, author_wallet: humanIdentity.wallet, author_username: humanIdentity.username ?? "Human" }),
      }).catch(() => {/* non-critical */});
    }
    setLinkText("");
    recordHistory({
      title: "Live chain link added",
      detail: text,
      kind: "post",
    });
    earnPoints(12, "Your chain link added value to today's field.");
    keepStreak("Your link joined today's global chain.");
    void humanHaptic("light");
  }

  async function publishMediaPost() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "publishing a moment")) {
      return;
    }

    if (postFile && postMediaType === "image") {
      const validation = validateMomentImage(postFile);

      if (!validation.ok) {
        act("Upload type not allowed", validation.issues[0] ?? humanChainErrorStates.upload_type_not_allowed);
        return;
      }
    }

    const caption =
      postCaption.trim() ||
      "A real human moment I want the chain to remember today.";
    const createdAt = new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    let mediaUrl = postPreview;
    let storageStatus: HumanPost["storageStatus"] = "local-safe";

    setIsPublishingPost(true);

    try {
      if (postFile) {
        const formData = new FormData();
        formData.append("file", postFile);

        const response = await fetch("/api/posts/upload", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          url?: string;
          pendingSetup?: boolean;
          message?: string;
          error?: string;
        };

        if (payload.ok && payload.url) {
          mediaUrl = payload.url;
          storageStatus = "cloud-safe";
        } else if (!payload.pendingSetup) {
          act("Image upload failed", payload.error ?? "The post will still publish in your app.");
        }
      }
    } catch {
      act("Post published", "Network upload was unavailable, but your post still joined the app.");
    } finally {
      setIsPublishingPost(false);
    }

    if (!mediaUrl) {
      act(
        postMediaType === "video" ? "Video required" : "Image required",
        "Add a real recent image or paid video before publishing to the Image posts chain.",
      );
      return;
    }

    const post: HumanPost = {
      id: Date.now(),
      author: humanIdentity?.username ?? "@you",
      authorWallet: humanIdentity?.wallet,
      caption,
      image: mediaUrl,
      mediaType: postMediaType,
      theme: "gold",
      reactions: 0,
      loves: 0,
      tips: 0,
      comments: [],
      createdAt,
      owner: true,
      storageStatus,
      tipSplit: {
        creatorPercent: 80,
        platformPercent: 20,
      },
    };

    setHumanPosts((current) => [post, ...current]);
    void storeSafeData("post", post.id, post).then((receipt) => {
      if (!receipt.ok) {
        return;
      }

      setHumanPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                dataReceiptUrl: receipt.url,
                storageStatus: "cloud-safe",
              }
            : item,
        ),
      );
    });
    setPostCaption("");
    setPostPreview(null);
    setPostFile(null);
    setPostMediaType("image");
    setShowPostComposer(false);
    recordHistory({
      title: postMediaType === "video" ? "Video post published" : "Image post published",
      detail:
        storageStatus === "cloud-safe"
          ? `${caption} ${postMediaType} file stored safely. Post receipt is being saved.`
          : `${caption} Saved locally now; backend receipt will attach when storage is configured.`,
      kind: "post",
    });
    earnPoints(postMediaType === "video" ? 22 : 16, `Your human ${postMediaType} post joined the visual chain.`);
    keepStreak(`You posted a human ${postMediaType} into today's chain.`);
    void humanHaptic("medium");
  }

  function deleteLink(link: ChainLink) {
    if (!link.owner) {
      return;
    }

    setLinks((current) =>
      current.filter((currentLink) =>
        link.id ? currentLink.id !== link.id : currentLink.text !== link.text,
      ),
    );
    act("Chain link deleted", "Your link was removed from this device.");
  }

  function publishPostWithPaymentCheck() {
    if (postMediaType === "video") {
      act("Photos only", "Moments accepts JPEG, PNG, or WebP photos. Select a photo to post your verified moment.");
      return;
    }

    void publishMediaPost();
  }

  function reactToPost(postId: number, reaction: string, field: "reactions" | "loves" = "reactions") {
    if (!requireVerifiedPublicAction(humanIdentity, act, "reacting publicly")) {
      return;
    }

    const key = String(postId);
    const currentSelection = momentReactions[key];
    const isSameReaction = currentSelection?.reaction === reaction;

    setHumanPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextPost = { ...post };

        if (currentSelection) {
          nextPost[currentSelection.field] = Math.max(0, nextPost[currentSelection.field] - 1);
          if (currentSelection.field !== "reactions") {
            nextPost.reactions = Math.max(0, nextPost.reactions - 1);
          }
        }

        if (!isSameReaction) {
          nextPost[field] = nextPost[field] + 1;
          if (field !== "reactions") {
            nextPost.reactions = nextPost.reactions + 1;
          }
        }

        return nextPost;
      }),
    );

    setMomentReactions((current) => {
      if (isSameReaction) {
        const next = { ...current };
        delete next[key];
        return next;
      }

      return {
        ...current,
        [key]: { field, reaction },
      };
    });

    recordHistory({
      title: isSameReaction ? `${reaction} removed` : `${reaction} sent`,
      detail: isSameReaction
        ? "Your reaction was deselected from this moment."
        : "You reacted once to this human moment.",
      kind: "reaction",
    });

    if (isSameReaction) {
      act("Reaction removed", "Your moment reaction was deselected.");
      return;
    }

    earnPoints(5, `Your ${reaction} reaction added life to a human post.`);
    act("Reaction recorded", "One human reaction is now attached to this moment.");
  }

  function commentOnPost(postId: number) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "commenting publicly")) {
      return;
    }

    const comment = commentDrafts[postId]?.trim();

    if (!comment) {
      act("Write a comment", "Add a real human response before sending.");
      return;
    }

    const validation = validateAnswerInput(comment);

    if (!validation.ok) {
      act("Comment needs work", validation.issues[0] ?? "Adjust the comment before publishing.");
      return;
    }

    setHumanPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, comments: [`${humanIdentity?.username ?? "@you"}: ${comment}`, ...post.comments] }
          : post,
      ),
    );
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    recordHistory({
      title: "Comment added",
      detail: comment,
      kind: "comment",
    });
    earnPoints(7, "Your comment gave another human a real response.");
  }

  function commentOnChainLink(key: string, author: string) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "commenting on a chain link")) {
      return;
    }

    const comment = chainCommentDrafts[key]?.trim();

    if (!comment) {
      act("Write a chain comment", "Add a useful response before sending.");
      return;
    }

    const validation = validateAnswerInput(comment);

    if (!validation.ok) {
      act("Comment needs work", validation.issues[0] ?? "Adjust the chain comment before publishing.");
      return;
    }

    setChainComments((current) => ({
      ...current,
      [key]: [`${humanIdentity?.username ?? "@you"}: ${comment}`, ...(current[key] ?? [])],
    }));
    setChainCommentDrafts((current) => ({ ...current, [key]: "" }));
    recordHistory({
      title: "Chain comment added",
      detail: `${comment} Reply to ${author}.`,
      kind: "comment",
    });
    earnPoints(7, "Your chain comment added context to a human link.");
  }

  function tipPost(post: HumanPost) {
    openPayment({
      title: post.mediaType === "video" ? "Tip video" : "Tip human",
      amount: "1 WLD",
      allowCustomAmount: true,
      context: {
        creatorWallet: post.authorWallet,
        payerWallet: humanIdentity?.wallet,
        tippedAuthor: post.author,
      },
      detail: `Send a thank-you tip for ${post.author}. HumanChain records an 80/20 creator-platform split receipt for settlement.`,
      success: "Tip payment is confirmed and the split receipt is stored.",
      feature: "tip-human",
      onConfirmed: (tipAmount) => {
        setHumanPosts((current) =>
          current.map((currentPost) =>
            currentPost.id === post.id
              ? { ...currentPost, tips: currentPost.tips + 1 }
              : currentPost,
          ),
        );
        recordHistory({
          title: "Post tip confirmed",
          detail: `${tipAmount} WLD tip confirmed for ${post.author}. Split receipt: 80% creator share, 20% HumanChain platform share.`,
          kind: "tip",
        });
        void storeSafeData("post", `tip-${post.id}-${Date.now()}`, {
          postId: post.id,
          author: post.author,
          authorWallet: post.authorWallet,
          amount: tipAmount,
          payerWallet: humanIdentity?.wallet,
          token: "WLD",
          split: post.tipSplit ?? { creatorPercent: 80, platformPercent: 20 },
        });
      },
      points: 4,
    });
  }

  function deletePost(postId: number) {
    const ownedPost = humanPosts.find((post) => post.id === postId && post.owner);

    if (!ownedPost) {
      act("Only your post", "You can delete posts that you published.");
      return;
    }

    setHumanPosts((current) => current.filter((post) => post.id !== postId));
    recordHistory({
      title: "Image post deleted",
      detail: ownedPost.caption,
      kind: "delete",
    });
    act("Post deleted", "The post was removed from your image chain and history remains recorded.");
  }

  function unlockCircle() {
    openPayment({
      title: "Create Chain Circle",
      amount: "3 WLD",
      detail: "Create one premium group for 12 verified humans with a topic room, invite slots, pinned prompt, and member activity pulse.",
      success: "Your 12-human Circle is live. Invite members and run the topic room.",
      feature: "chain-circle",
      points: 24,
      onConfirmed: () => {
        const paidAt = formatCheckInTime(new Date());
        setChainPremium((current) => ({
          ...current,
          circleCreated: true,
          circleName: current.circleName ?? "Human Circle",
          circlePaidAt: paidAt,
        }));
        recordHistory({
          title: "Chain Circle created",
          detail: "3 WLD confirmed. A 12-human premium group is ready with invite slots, pinned prompt, activity pulse, and quote room.",
          kind: "profile",
        });
        act("Circle created", "Your 12-human room is live. Start the topic and invite members.");
        setActiveChainTool("circle");
      },
    });
  }

  function unlockWorldPulse() {
    openPayment({
      title: "Unique World Pulse",
      amount: "1 WLD",
      detail: "Unlock the premium pulse for live link sentiment, strongest human quote, active field, and who is moving the chain today.",
      success: "World Pulse unlocked for this chain.",
      feature: "world-pulse",
      points: 12,
      onConfirmed: () => {
        setChainPremium((current) => ({
          ...current,
          pulsePaidAt: formatCheckInTime(new Date()),
          pulseUnlocked: true,
        }));
        recordHistory({
          title: "World Pulse unlocked",
          detail: "1 WLD confirmed. Unique pulse insights are visible in Chains.",
          kind: "profile",
        });
        act("World Pulse unlocked", "Live sentiment, strongest quote, and chain leaders are now visible.");
        setActiveChainTool("pulse");
      },
    });
  }

  function payToPin(item: { id?: number; kind: "link" | "post"; label: string; text: string }) {
    openPayment({
      title: "Pin Chain Item",
      amount: "4 WLD",
      detail: `Pin "${item.label}" to the top of Chains with a premium badge and priority placement.`,
      success: "Pinned item is now prioritized at the top of Chains.",
      feature: "pin-chain-item",
      points: 18,
      onConfirmed: () => {
        const pinnedAt = formatShortTime(new Date());

        if (item.kind === "link") {
          setLinks((current) =>
            current.map((link) =>
              (item.id ? link.id === item.id : link.text === item.text)
                ? { ...link, pinned: true, pinnedAt }
                : link,
            ),
          );
        } else {
          setHumanPosts((current) =>
            current.map((post) =>
              post.id === item.id ? { ...post, pinned: true, pinnedAt } : post,
            ),
          );
        }

        recordHistory({
          title: "Chain item pinned",
          detail: `4 WLD confirmed. ${item.label} now appears at the top with premium placement.`,
          kind: "profile",
        });
        act("Pinned", `"${item.label}" is now at the top of Chains with a premium badge.`);
        setActiveChainTool("pin");
      },
    });
  }

  async function copyQuote(text: string, source: string) {
    const quote = `${text} - ${source}`;
    try {
      await navigator.clipboard.writeText(quote);
      earnPoints(3, "Copied wisdom from a Human Field.");
      act("Quote copied", "You can paste this wisdom anywhere.");
    } catch {
      act("Quote ready", quote);
    }
  }

  if (activeField) {
    const room =
      fieldQuoteRooms[activeField.name as keyof typeof fieldQuoteRooms] ?? null;

    if (!room) {
      return (
        <div className="screen">
          <section className="field-room-hero">
            <button onClick={() => setActiveField(null)} type="button">Back</button>
            <h2>{activeField.name}</h2>
            <p>No content available for this field yet.</p>
          </section>
        </div>
      );
    }

    return (
      <div className="screen">
        <section className="field-room-hero">
          <button onClick={() => setActiveField(null)} type="button">
            Back
          </button>
          <span>Verified humans</span>
          <h2>{activeField.name}</h2>
          <p>{room.intro}</p>
        </section>
        <section className="field-quote-list">
          {room.quotes.map((quote) => (
            <article className="field-quote-card" key={quote.text}>
              <span>{quote.source}</span>
              <p>{quote.text}</p>
              <small>{quote.meaning}</small>
              <button
                onClick={() => copyQuote(quote.text, quote.source)}
                type="button"
              >
                Copy quote
              </button>
            </article>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="screen chains-screen">
      <TopBar title="Moments" subtitle="Proof-of-life posts from verified humans." />
      <section className="chain-tools">
        <button
          onClick={() => {
            setActiveChainTool((current) => current === "circle" ? null : "circle");
            act("Circle guide opened", "Create a 12-human premium group after the 3 WLD payment.");
          }}
          type="button"
        >
          <Users size={17} />
          Circle
        </button>
        <button
          onClick={() => {
            setActiveChainTool((current) => current === "pulse" ? null : "pulse");
            act("Pulse guide opened", "Unlock the unique World Pulse after the 1 WLD payment.");
          }}
          type="button"
        >
          <HeartHandshake size={17} />
          Pulse
        </button>
        <button
          onClick={() => {
            setActiveChainTool((current) => current === "pin" ? null : "pin");
            act("Pin guide opened", "Choose a link or post, pay 4 WLD, and it moves to the top.");
          }}
          type="button"
        >
          <Star size={17} />
          Pin
        </button>
      </section>
      {activeChainTool ? (
        <section className={`chain-premium-panel ${activeChainTool}`}>
          {activeChainTool === "circle" ? (
            <>
              <span className="section-kicker">Premium Circle - 3 WLD</span>
              <h2>Build a private group of 12 verified humans.</h2>
              <p>
                A Circle gives the creator invite slots, a pinned topic prompt,
                member reactions, group quote room access, and a cleaner place
                to grow one serious human discussion.
              </p>
              <div className="premium-benefit-grid">
                {[
                  "12 verified-human seats",
                  "Creator badge and pinned prompt",
                  "Group pulse and activity score",
                  "Best links rise inside the Circle",
                ].map((benefit) => (
                  <span key={benefit}>{benefit}</span>
                ))}
              </div>
              {chainPremium.circleCreated ? (
                <div className="circle-room">
                  <strong>{chainPremium.circleName ?? "Human Circle"}</strong>
                  <small>Created {chainPremium.circlePaidAt}. 12 invite seats ready.</small>
                  <div>
                    {Array.from({ length: 12 }).map((_, index) => (
                      <span key={index}>{index === 0 ? "You" : `Seat ${index + 1}`}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <Haptic variant="impact" type="medium" asChild>
                  <Button variant="primary" fullWidth onClick={() => { impact("medium"); unlockCircle(); }} type="button">
                    Create Circle - 3 WLD
                  </Button>
                </Haptic>
              )}
            </>
          ) : null}
          {activeChainTool === "pulse" ? (
            <>
              <span className="section-kicker">Unique World Pulse - 1 WLD</span>
              <h2>See what the chain is feeling right now.</h2>
              <p>
                Pulse turns live links and reactions into a premium snapshot:
                strongest human quote, active field, energy level, and the
                handle moving today&apos;s chain.
              </p>
              {chainPremium.pulseUnlocked ? (
                <div className="world-pulse-card">
                  <strong>World Pulse: rising</strong>
                  <span>{visibleLinks.length} live links scanned</span>
                  <span>Strongest quote: {visibleLinks[0]?.text ?? "Add a link to start the pulse."}</span>
                  <span>Top human: {visibleLinks[0] ? getChainLinkAuthor(visibleLinks[0]) : humanIdentity?.username ?? "@you"}</span>
                  <small>Unlocked {chainPremium.pulsePaidAt}</small>
                </div>
              ) : (
                <Haptic variant="impact" type="medium" asChild>
                  <Button variant="primary" fullWidth onClick={() => { impact("medium"); unlockWorldPulse(); }} type="button">
                    Unlock Pulse - 1 WLD
                  </Button>
                </Haptic>
              )}
            </>
          ) : null}
          {activeChainTool === "pin" ? (
            <>
              <span className="section-kicker">Premium Pin - 4 WLD each</span>
              <h2>Pin any link or post to the top of Chains.</h2>
              <p>
                Pick the link or post that deserves attention. After payment it
                gets a premium badge, stays above normal content, and records
                the pin in your activity history.
              </p>
              <div className="pin-guide-grid">
                <span>1. Choose a link or image post</span>
                <span>2. Confirm 4 WLD in World App</span>
                <span>3. Pinned item moves to the top</span>
              </div>
            </>
          ) : null}
        </section>
      ) : null}
      <section className="chain-map">
        <span className="section-kicker">World field</span>
        <h2>Moments, links, and quote rooms from real humans.</h2>
        <div className="chain-orbit" aria-hidden="true">
          <span />
          <i />
          <b />
        </div>
      </section>
      <div className="chain-tabs">
        <button
          className={chainView === "images" ? "active" : ""}
          onClick={() => setChainView("images")}
          type="button"
        >
          Moments
        </button>
        <button
          className={chainView === "quotes" ? "active" : ""}
          onClick={() => setChainView("quotes")}
          type="button"
        >
          Links
        </button>
        <button
          className={chainView === "groups" ? "active" : ""}
          onClick={() => setChainView("groups")}
          type="button"
        >
          Quote Rooms
        </button>
      </div>
      {chainView === "images" ? (
        <section className="image-post-grid">
          <section className="moment-safety-card" aria-label="Community rules before posting">
            <div className="section-heading">
              <span>Community Rules</span>
              <ShieldCheck size={18} />
            </div>
            <p>Allowed: travel, projects, achievements, learning, community events, and daily life.</p>
            <div>
              {["Respect others", "No harassment", "No pornography", "No hate speech", "No violence", "No scams", "No illegal content", "No spam"].map((rule) => (
                <span key={rule}>{rule}</span>
              ))}
            </div>
            <small>Every image is checked before it appears. Blocked content never enters Moments.</small>
          </section>
          {!showPostComposer && !postPreview ? (
            <section className="moment-create-prompt">
              <div>
                <span>Moment composer</span>
                <strong>Hidden until you need it</strong>
                <p>Browse first. When you are ready, open the composer and add a recent real photo with a human caption.</p>
              </div>
              <button onClick={() => setShowPostComposer(true)} type="button">
                <PlusCircle size={17} />
                Post moment
              </button>
            </section>
          ) : (
            <section className="image-chain-card">
              <div className="composer-title-row">
                <div>
                  <span className="section-kicker">Human Image Chain</span>
                  <h2>Post a recent moment. Make the chain feel alive.</h2>
                </div>
                <button
                  aria-label="Hide moment composer"
                  onClick={() => {
                    setShowPostComposer(false);
                    setPostCaption("");
                    setPostPreview(null);
                    setPostFile(null);
                    setPostMediaType("image");
                  }}
                  type="button"
                >
                  Hide
                </button>
              </div>
              <p>
                Share what just happened, what you saw, built, cooked, fixed, felt,
                or survived today. Recent moments carry more human energy.
              </p>
              <div className="recent-moment-strip">
                <span>Now</span>
                <span>Real photo</span>
                <span>Human caption</span>
              </div>
              {postPreview ? (
                postMediaType === "video" ? (
                  <video controls src={postPreview} />
                ) : (
                  <img alt="Selected human post" src={postPreview} />
                )
              ) : (
                <div className="image-post-placeholder">
                  <div className="moment-lens" aria-hidden="true">
                    <span />
                    <i />
                  </div>
                  <Upload size={22} />
                  <span>Recent image preview appears here before it enters the chain.</span>
                </div>
              )}
              <textarea
                onChange={(event) => setPostCaption(event.target.value)}
                placeholder="Write what this image means..."
                value={postCaption}
              />
              <div className="image-post-actions">
                <label>
                  <Upload size={17} />
                  Add image
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        if (!file.type.startsWith("image/")) {
                          act("Photos only", "Select a JPEG, PNG, or WebP photo to post your verified moment.");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onload = async () => {
                          const preparedFile = await prepareMomentImage(file);
                          setPostPreview(String(reader.result));
                          setPostFile(preparedFile);
                          setPostMediaType("image");
                          act(
                            "Image selected",
                            preparedFile.size < file.size
                                ? "Image optimized for faster upload. Add a caption, then publish it."
                                : "Add a caption, then publish it.",
                          );
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    type="file"
                  />
                </label>
                <Haptic variant="impact" type="medium" asChild>
                  <Button variant="primary" disabled={isPublishingPost} onClick={() => { impact("medium"); publishPostWithPaymentCheck(); }} type="button">
                    {isPublishingPost ? <Spinner /> : null}
                    {isPublishingPost ? "Publishing..." : "Publish image"}
                  </Button>
                </Haptic>
              </div>
            </section>
          )}
          <div className="chain-section-note">
            <span>Recent human moments</span>
            <p>Photo posts from verified humans. Every card begins with the human, the caption, and the real image they shared.</p>
          </div>
          {visiblePosts.length === 0 && (
            <div className="chains-empty-state">
              <span>📷</span>
              <strong>No image posts yet</strong>
              <p>Share a moment with a photo to be the first one here.</p>
            </div>
          )}
          {visiblePosts.map((post, index) => {
            const selectedReaction = momentReactions[String(post.id)];
            const authorInitial = post.author.replace(/^@/, "").charAt(0).toUpperCase();
            const totalEngagement = post.reactions + post.loves + post.tips;

            return (
            <article className={`image-post ${post.pinned ? "pinned" : ""}`} key={post.id}>
              <div>
                {/* Author row */}
                <div className="post-head">
                  <div className="post-author-row">
                    <div className="post-avatar" aria-hidden="true">{authorInitial}</div>
                    <div>
                      <strong>{post.author}</strong>
                      <small>{post.createdAt}{post.storageStatus === "cloud-safe" ? " · ☁" : ""}</small>
                    </div>
                  </div>
                  <div className="post-head-right">
                    {post.pinned ? <span className="pin-badge">Pinned</span> : null}
                    {post.owner ? (
                      <button
                        className="delete-post-button"
                        onClick={() => deletePost(post.id)}
                        title="Delete your post"
                        type="button"
                      >
                        ✕
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Caption */}
                <p className="post-caption">{post.caption}</p>

                {/* Media */}
                <div
                  aria-label={`${post.author}'s moment`}
                  className="image-post-media"
                  role="group"
                >
                  {post.mediaType === "video" ? (
                    <video controls src={post.image ?? undefined} />
                  ) : (
                    <img
                      alt={post.caption}
                      decoding="async"
                      loading={index < 3 ? "eager" : "lazy"}
                      src={post.image ?? undefined}
                    />
                  )}
                </div>

                {/* Engagement bar */}
                <div className="post-metrics">
                  <span>{post.loves > 0 ? `♥ ${post.loves}` : "♥ 0"}</span>
                  <span>{post.reactions > 0 ? `✦ ${post.reactions}` : "✦ 0"}</span>
                  <span>{post.tips > 0 ? `⚡ ${post.tips} tips` : ""}</span>
                  <span>{post.comments.length > 0 ? `${post.comments.length} comment${post.comments.length !== 1 ? "s" : ""}` : ""}</span>
                  {totalEngagement > 5 && <span className="post-hot-tag">🔥 Active</span>}
                </div>

                {/* Actions */}
                <div className="reaction-row social-actions">
                  <button
                    aria-pressed={selectedReaction?.reaction === "Love"}
                    className={`post-love-btn${selectedReaction?.reaction === "Love" ? " active" : ""}`}
                    onClick={() => reactToPost(post.id, "Love", "loves")}
                    type="button"
                  >
                    {selectedReaction?.reaction === "Love" ? "♥ Loved" : "♥ Love"}
                  </button>
                  <button
                    aria-pressed={selectedReaction?.reaction === "Inspired"}
                    className={selectedReaction?.reaction === "Inspired" ? "active" : ""}
                    onClick={() => reactToPost(post.id, "Inspired")}
                    type="button"
                  >
                    Inspired
                  </button>
                  <button
                    onClick={() => setActiveCommentPostId(post.id)}
                    type="button"
                  >
                    {post.comments.length > 0 ? `💬 ${post.comments.length}` : "Comment"}
                  </button>
                  <button
                    onClick={() => tipPost(post)}
                    type="button"
                  >
                    ⚡ Tip
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        void navigator.share({ title: post.caption, text: `${post.author} on HumanChain: "${post.caption}"` })
                          .then(() => act("Shared", "Moment shared successfully."))
                          .catch(() => {});
                      } else {
                        void navigator.clipboard?.writeText(`${post.author} on HumanChain: "${post.caption}"`)
                          .then(() => act("Copied!", "Moment text copied to clipboard."))
                          .catch(() => act("Share", "Open in World App to share this moment."));
                      }
                    }}
                    type="button"
                  >
                    Share
                  </button>
                  {post.owner ? (
                    <button
                      onClick={() =>
                        payToPin({
                          id: post.id,
                          kind: "post",
                          label: post.caption.slice(0, 42),
                          text: post.caption,
                        })
                      }
                      type="button"
                    >
                      Promote
                    </button>
                  ) : null}
                </div>

                {/* Top comments preview */}
                {post.comments.length > 0 && (
                  <div className="comment-list">
                    {post.comments.slice(0, 2).map((comment, ci) => (
                      <div key={`${post.id}-${ci}`} className="comment-preview-row">
                        <span className="comment-av">{comment.replace(/^@(\w+).*/, "$1").charAt(0).toUpperCase()}</span>
                        <span>{comment}</span>
                      </div>
                    ))}
                    {post.comments.length > 2 && (
                      <button className="comment-view-all" onClick={() => setActiveCommentPostId(post.id)} type="button">
                        View all {post.comments.length} comments
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
            );
          })}
          {activeCommentPost ? (
            <div className="comment-sheet-backdrop" role="presentation">
              <section
                aria-label={`Comments for ${activeCommentPost.author}`}
                aria-modal="true"
                className="comment-sheet"
                role="dialog"
              >
                <div className="comment-sheet-handle" />
                <div className="comment-sheet-top">
                  <div>
                    <strong>{activeCommentPost.author}</strong>
                    <span>{activeCommentPost.caption}</span>
                  </div>
                  <button onClick={() => setActiveCommentPostId(null)} type="button">
                    Close
                  </button>
                </div>
                <div className="comment-sort-row" aria-label="Comment sorting">
                  {[
                    ["relevant", "Most relevant"],
                    ["newest", "Newest"],
                  ].map(([key, label]) => (
                    <button
                      aria-pressed={commentSort === key}
                      className={commentSort === key ? "active" : ""}
                      key={key}
                      onClick={() => setCommentSort(key as typeof commentSort)}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="comment-thread">
                  {activeComments.length ? (
                    activeComments.map((comment, index) => (
                      <article key={`${activeCommentPost.id}-${comment}-${index}`}>
                        <strong>{comment.includes(":") ? comment.split(":")[0] : "@verified_human"}</strong>
                        <p>{comment.includes(":") ? comment.split(":").slice(1).join(":").trim() : comment}</p>
                        <button onClick={() => { const text = comment.includes(":") ? comment.split(":").slice(1).join(":").trim() : comment; window.open(`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}`, "_blank"); }} type="button">
                          Translate
                        </button>
                      </article>
                    ))
                  ) : (
                    <div className="comment-empty">
                      <strong>No comments yet</strong>
                      <span>Start the thread with a useful human response.</span>
                    </div>
                  )}
                </div>
                <label className="comment-sheet-composer labeled">
                  <span>Add a public comment</span>
                  <input
                    aria-label="Add a public moment comment"
                    onChange={(event) =>
                      setCommentDrafts((current) => ({
                        ...current,
                        [activeCommentPost.id]: event.target.value,
                      }))
                    }
                    placeholder="Add a real comment..."
                    value={commentDrafts[activeCommentPost.id] ?? ""}
                  />
                  <button
                    disabled={!commentDrafts[activeCommentPost.id]?.trim()}
                    onClick={() => commentOnPost(activeCommentPost.id)}
                    type="button"
                  >
                    Send
                  </button>
                </label>
              </section>
            </div>
          ) : null}
        </section>
      ) : chainView === "groups" ? (
        <section className="groups-stack">
          <div className="chain-section-note">
            <span>Permanent quote rooms</span>
            <p>These are stable HumanChain quote libraries. Enter a field to read and copy deeper wisdom for that part of life.</p>
          </div>
          <div className="permanent-quote-grid">
            {chainQuoteLibrary.slice(0, 6).map((quote) => (
              <article className="permanent-quote-card" key={`${quote.country}-${quote.text}`}>
                <span>{quote.country}</span>
                <p>{quote.text}</p>
                <button
                  onClick={() => copyQuote(quote.text, quote.country)}
                  type="button"
                >
                  Copy
                </button>
              </article>
            ))}
          </div>
          <div className="field-grid">
            {chainFields.map((field) => (
              <article className="field-card" key={field.name}>
                <div className="field-card-meta">
                  <span className="field-live-dot" aria-hidden="true" />
                  <span>{field.members} members</span>
                  <span>·</span>
                  <span>Active now</span>
                </div>
                <div>
                  <strong>{field.name}</strong>
                <span>Verified humans</span>
                </div>
                <p>{field.detail}</p>
                <button
                  onClick={() => {
                    // Award HP only once per field room per calendar day
                    const visitKey = `hc_field_visit:${field.name}:${getLocalDateKey()}`;
                    if (!window.localStorage.getItem(visitKey)) {
                      window.localStorage.setItem(visitKey, "1");
                      earnPoints(6, `You entered ${field.name} and expanded your human map.`);
                    }
                    setActiveField(field);
                    act(`${field.name} opened`, "Read, copy, and carry useful field wisdom.");
                  }}
                  type="button"
                >
                  Enter quote room
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="thread-list" aria-label="Human thread">
          <section className="today-chain">
            <span className="section-kicker">Today&apos;s main chain</span>
            <h2>What truth should the world carry today?</h2>
            <p>
              Add one useful link: a lesson, memory, warning, prayer, business
              truth, cultural wisdom, or voice thought another human may need.
            </p>
            <textarea
              onChange={(event) => setLinkText(event.target.value)}
              placeholder="Write your link..."
              value={linkText}
            />
            <button onClick={addLink} type="button">
              Add My Link
            </button>
          </section>
          <div className="chain-section-note live-note">
            <span>Live chain quotes</span>
            <p>Live handles, fresh reactions, and human links from Today&apos;s main chain. Add your link above and it appears here first.</p>
          </div>
          <div className="chain-daily-highlight">
            <span className="cdh-label">Today&apos;s Human Question</span>
            <p className="cdh-question">{getDailyQuestion()}</p>
            <small className="cdh-note">Answer below — your link appears in the live chain.</small>
          </div>
          {visibleLinks.map((link, index) => {
            const author = getChainLinkAuthor(link, humanIdentity?.username ?? "@verified_human");
            const pulse = getChainLinkPulse(link, index);
            const linkCommentKey = getChainCommentKey(link, index);
            const linkComments = chainComments[linkCommentKey] ?? [];

            return (
            <article className={`thread-item lively ${link.pinned ? "pinned" : ""}`} key={`${author}-${link.text}-${index}`}>
              <span className="thread-dot" aria-hidden="true" />
              <div className="thread-body">
                <div className="thread-author-row">
                  <span className="thread-avatar">{author.slice(1, 3).toUpperCase()}</span>
                  <div>
                    <strong>{link.pinned ? "Pinned - " : ""}{author}</strong>
                    <small>{pulse.createdAt} - {pulse.reactions} felt this - {link.pinned ? `top chain since ${link.pinnedAt}` : "live link"}</small>
                  </div>
                  {link.pinned ? <span className="pin-badge">Top</span> : null}
                </div>
                <p>{link.text}</p>
                <div className="reaction-row">
                  {link.owner && <button
                    onClick={() =>
                      payToPin({
                        id: link.id,
                        kind: "link",
                        label: `${author} link`,
                        text: link.text,
                      })
                    }
                    type="button"
                  >
                    Pin 4 WLD
                  </button>}
                  <button
                    onClick={() => {
                      setLinks((current) =>
                        current.map((currentLink) =>
                          (link.id ? currentLink.id === link.id : currentLink.text === link.text)
                            ? { ...currentLink, reactions: (currentLink.reactions ?? pulse.reactions) + 1 }
                            : currentLink,
                        ),
                      );
                      act("Reaction sent", `You told ${author}: I felt this.`);
                    }}
                    type="button"
                  >
                    I felt this
                  </button>
                  <button
                    onClick={() =>
                      openPayment({
                        title: "Tip chain link",
                        amount: "1 WLD",
                        allowCustomAmount: true,
                        context: {
                          payerWallet: humanIdentity?.wallet,
                          tippedAuthor: author,
                        },
                        detail: `Send a small thank-you to ${author}.`,
                        success: "Tip is ready for World App payment.",
                        feature: "tip-chain-link",
                        points: 4,
                        onConfirmed: async () => {
                          setLinks((current) =>
                            current.map((l) =>
                              (link.id ? l.id === link.id : l.text === link.text)
                                ? { ...l, tips: (l.tips ?? 0) + 1 }
                                : l,
                            ),
                          );
                        },
                      })
                    }
                    type="button"
                  >
                    Tip human
                  </button>
                  <button
                    onClick={() => setActiveChainCommentKey(linkCommentKey)}
                    type="button"
                  >
                    Comments {linkComments.length}
                  </button>
                  {link.owner ? (
                    <button
                      className="danger"
                      onClick={() => deleteLink(link)}
                      type="button"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                {linkComments.length ? (
                  <div className="comment-list">
                    <span>{linkComments[0]}</span>
                    {linkComments.length > 1 ? (
                      <button onClick={() => setActiveChainCommentKey(linkCommentKey)} type="button">
                        View all {linkComments.length} comments
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
            );
          })}
          {activeChainCommentKey ? (
            <div className="comment-sheet-backdrop" role="presentation">
              <section
                aria-label="Chain link comments"
                aria-modal="true"
                className="comment-sheet"
                role="dialog"
              >
                <div className="comment-sheet-handle" />
                <div className="comment-sheet-top">
                  <div>
                    <strong>{activeChainCommentEntry ? getChainLinkAuthor(activeChainCommentEntry, humanIdentity?.username ?? "@verified_human") : "Chain comments"}</strong>
                    <span>{activeChainCommentEntry?.text ?? "Reply to this human chain link."}</span>
                  </div>
                  <button onClick={() => setActiveChainCommentKey(null)} type="button">
                    Close
                  </button>
                </div>
                <div className="comment-sort-row" aria-label="Chain comment sorting">
                  <button className={chainLinkCommentSort === "top" ? "active" : ""} onClick={() => setChainLinkCommentSort("top")} type="button">Top</button>
                  <button className={chainLinkCommentSort === "newest" ? "active" : ""} onClick={() => setChainLinkCommentSort("newest")} type="button">Newest</button>
                </div>
                <div className="comment-thread">
                  {activeChainComments.length ? (
                    activeChainComments.map((comment, index) => (
                      <article key={`${activeChainCommentKey}-${comment}-${index}`}>
                        <strong>{comment.includes(":") ? comment.split(":")[0] : "@verified_human"}</strong>
                        <p>{comment.includes(":") ? comment.split(":").slice(1).join(":").trim() : comment}</p>
                        <button onClick={() => { const text = comment.includes(":") ? comment.split(":").slice(1).join(":").trim() : comment; window.open(`https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}`, "_blank"); }} type="button">
                          Translate
                        </button>
                      </article>
                    ))
                  ) : (
                    <div className="comment-empty">
                      <strong>No comments yet</strong>
                      <span>Start a thoughtful reply to this chain link.</span>
                    </div>
                  )}
                </div>
                <label className="comment-sheet-composer labeled">
                  <span>Add a public comment</span>
                  <input
                    aria-label="Add a public chain comment"
                    onChange={(event) =>
                      setChainCommentDrafts((current) => ({
                        ...current,
                        [activeChainCommentKey]: event.target.value,
                      }))
                    }
                    placeholder="Write a useful reply..."
                    value={chainCommentDrafts[activeChainCommentKey] ?? ""}
                  />
                  <button
                    disabled={!chainCommentDrafts[activeChainCommentKey]?.trim()}
                    onClick={() =>
                      commentOnChainLink(
                        activeChainCommentKey,
                        activeChainCommentEntry
                          ? getChainLinkAuthor(activeChainCommentEntry, humanIdentity?.username ?? "@verified_human")
                          : "@verified_human",
                      )
                    }
                    type="button"
                  >
                    Send
                  </button>
                </label>
              </section>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
