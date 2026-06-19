"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Globe2,
  ImageIcon,
  Lock,
  Plus,
  Star,
  Users,
} from "lucide-react";
import { loadJsonFromStorage, saveJsonToStorage, storageKeys } from "@/lib/humanchain/storage";
import type { OpenPayment, EarnPoints, Tab } from "@/types/ui";
import type { VerifiedHuman } from "@/types/user";
import { getWorldMiniAppContext } from "@/lib/worldMiniApp";

// ── Types ─────────────────────────────────────────────────────────────────────

type CultureRoom = {
  id: string;
  name: string;
  region: string;
  flag: string;
  tagline: string;
  preview: string;
  topics: string[];
  members: number;
  stories: number;
  entryFee: string;
  color: string;
  creator: string;
  featured: boolean;
};

type CulturePost = {
  id: string;
  author: string;
  flag: string;
  title: string;
  body: string;
  imageDesc?: string;
  likes: number;
  createdAt: string;
};

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_ROOMS: CultureRoom[] = [
  {
    id: "yoruba",
    name: "Yoruba Heritage",
    region: "Nigeria · West Africa",
    flag: "🇳🇬",
    tagline: "Where proverbs carry centuries of wisdom",
    preview: "Enter the world of Yoruba — one of Africa's richest living cultures. Explore ancient proverbs, festival traditions, and the art of Ifa divination that shaped a continent.",
    topics: ["Language", "Festivals", "Food", "Proverbs", "Art"],
    members: 3240,
    stories: 188,
    entryFee: "2 WLD",
    color: "#1a6b40",
    creator: "@adaeze_ng",
    featured: true,
  },
  {
    id: "swahili",
    name: "Swahili Coast",
    region: "Kenya · Tanzania · Zanzibar",
    flag: "🇰🇪",
    tagline: "From dhow traders to digital humans",
    preview: "The Swahili Coast blends African, Arab, and Indian Ocean traditions into a unique maritime civilization. Discover taarab music, pilau rice secrets, and Stone Town at dawn.",
    topics: ["Trade History", "Music", "Food", "Architecture", "Language"],
    members: 2180,
    stories: 134,
    entryFee: "2 WLD",
    color: "#1a4a6b",
    creator: "@mwangi_k",
    featured: true,
  },
  {
    id: "andean",
    name: "Andean Roots",
    region: "Peru · Bolivia · Ecuador",
    flag: "🇵🇪",
    tagline: "The living Inca — more present than you know",
    preview: "Quechua survives in 10 million mouths. Andean weaving encodes cosmology in thread. Pachamama is not mythology — she is daily practice. Enter and understand.",
    topics: ["Quechua", "Weaving", "Spirituality", "Food", "Music"],
    members: 1870,
    stories: 112,
    entryFee: "2 WLD",
    color: "#6b2a18",
    creator: "@inti_quispe",
    featured: false,
  },
  {
    id: "cantonese",
    name: "Cantonese World",
    region: "Hong Kong · Guangdong · Diaspora",
    flag: "🇭🇰",
    tagline: "Nine tones, ten thousand flavours",
    preview: "Cantonese is more than a dialect — it is an identity carried across oceans. From dim sum philosophy to Cantopop, this is a culture of precision, warmth, and refusal to disappear.",
    topics: ["Language", "Dim Sum", "Opera", "Business", "Film"],
    members: 4120,
    stories: 267,
    entryFee: "2 WLD",
    color: "#6b1a1a",
    creator: "@wing_hk",
    featured: true,
  },
  {
    id: "caribbean",
    name: "Caribbean Rhythm",
    region: "Jamaica · Trinidad · Barbados",
    flag: "🇯🇲",
    tagline: "Resistance, rhythm, and radical joy",
    preview: "Every Caribbean musical form — reggae, calypso, soca, steelpan — is a political act turned joyful. Enter a culture built on survival and celebration that the world keeps borrowing from.",
    topics: ["Music", "Carnival", "Food", "Patois", "History"],
    members: 5640,
    stories: 341,
    entryFee: "2 WLD",
    color: "#1a4a1e",
    creator: "@rasta_t",
    featured: true,
  },
  {
    id: "sahelian",
    name: "Sahelian Wisdom",
    region: "Senegal · Mali · Burkina Faso",
    flag: "🇸🇳",
    tagline: "The griot never forgets",
    preview: "Griots are living libraries — oral historians who carry the knowledge of kingdoms. Sufi brotherhoods shape daily life. Teranga is not hospitality, it is identity. Enter the Sahel.",
    topics: ["Griots", "Sufi Music", "Hospitality", "Trade", "Textiles"],
    members: 1430,
    stories: 89,
    entryFee: "2 WLD",
    color: "#5a3a12",
    creator: "@moussa_dakar",
    featured: false,
  },
  {
    id: "hindi-heartland",
    name: "Hindi Heartland",
    region: "North India · Diaspora",
    flag: "🇮🇳",
    tagline: "Where every festival is a community covenant",
    preview: "North India is not one culture but a galaxy. Holi is chemistry and philosophy. Biryani is diplomacy. Classical dance encodes ancient science. Come with curiosity and leave full.",
    topics: ["Festivals", "Classical Arts", "Cuisine", "Language", "Spirituality"],
    members: 8920,
    stories: 512,
    entryFee: "2 WLD",
    color: "#5a1a6b",
    creator: "@priya_delhi",
    featured: true,
  },
  {
    id: "nordic",
    name: "Nordic Folk",
    region: "Norway · Sweden · Finland",
    flag: "🇳🇴",
    tagline: "Darkness teaches you to find light within",
    preview: "Norse mythology lives in place names. Hygge is not a trend — it is a winter survival philosophy built by people who understood that warmth is something you make, not something you find.",
    topics: ["Mythology", "Folk Craft", "Food", "Design", "Nature"],
    members: 2760,
    stories: 156,
    entryFee: "2 WLD",
    color: "#1a2e4a",
    creator: "@sigrid_oslo",
    featured: false,
  },
];

const SEED_POSTS: Record<string, CulturePost[]> = {
  yoruba: [
    {
      id: "y1", author: "@adaeze_ng", flag: "🇳🇬",
      title: "The Proverb That Saved My Marriage",
      body: "\"Ọmọ tí a kò kọ ni yóò jẹ àgbàdo tí a kò fọ\" — The child we don't educate will eat the corn we didn't peel. My grandmother said this to me at my wedding. I thought it was just advice. Fifteen years later I understand she gave me the entire philosophy of Yoruba parenting in one sentence. We don't discipline children because we fear them. We educate them because we respect who they will become.",
      likes: 234, createdAt: "2 days ago",
    },
    {
      id: "y2", author: "@tunde_ibadan", flag: "🇳🇬",
      title: "Egungun — What Tourists Miss",
      body: "When the Egungun masquerade appears, he is not a man in costume. He is your ancestor visiting from the other side. The swirling fabric is a portal. Visitors photograph it as performance art. But when my father's Egungun came to our compound, grown men wept. The masquerade called my father's childhood name that nobody alive still remembers. I have no rational explanation. I have only what I witnessed.",
      imageDesc: "Layers of indigo and gold cloth spinning in the afternoon light of a Yoruba compound. Children pressed against walls. Elders kneeling.",
      likes: 456, createdAt: "5 days ago",
    },
    {
      id: "y3", author: "@ola_lagos", flag: "🇳🇬",
      title: "Why We Say 'E Kaaro' Not 'Good Morning'",
      body: "In Yoruba, greetings are not pleasantries — they are acknowledgements of existence. E kaaro (morning), E kaasan (afternoon), E kaale (evening) — each one says: I see that you have made it through another cycle. We greet kneeling or prostrating because respect is embodied, not spoken. When my son forgot to greet his grandmother, she went quiet until he understood. The silence taught more than any lecture.",
      likes: 189, createdAt: "1 week ago",
    },
  ],
  swahili: [
    {
      id: "s1", author: "@fatuma_mombasa", flag: "🇰🇪",
      title: "Pilau Is Not Rice. Pilau Is a Statement.",
      body: "The Arab traders brought cardamom. The Indian Ocean brought cumin. The Swahili coast added its own soul. When my mother makes pilau for a wedding, she begins three days before. The spices are ground by hand because the electric grinder changes the spirit of the spice, she says. I thought she was being poetic. Then I tasted the difference. The hand-ground pilau carries warmth that no machine produces. It carries her.",
      likes: 312, createdAt: "3 days ago",
    },
    {
      id: "s2", author: "@omar_zanzibar", flag: "🇹🇿",
      title: "Stone Town at 4am",
      body: "Before the tourists, before the heat — Stone Town belongs to itself. The call to prayer from three mosques overlapping. The smell of salt and clove. Old men in white kanzus walking paths carved into coral stone by Ottoman-era builders. My grandfather walked these same alleys to the same mosque. The coral stone has absorbed eight centuries of footsteps. This is what we mean when we say Swahili culture is a living archive — the walls themselves remember.",
      imageDesc: "Carved wooden doors of Stone Town at dawn. Salt-weathered wood, a sleeping cat on the step, light just beginning to come.",
      likes: 567, createdAt: "1 week ago",
    },
  ],
  caribbean: [
    {
      id: "c1", author: "@kezia_kingston", flag: "🇯🇲",
      title: "What Bob Never Told You About Rastafari",
      body: "Rastafari is not a music genre. It is a complete epistemology — a way of knowing the world. Ital food is not a diet, it is a refusal of systems that commodify life. The locked hair is not a style, it is a covenant with nature. The movement predicted corporate food harm, surveillance states, and the commodification of Black identity — decades before these were mainstream concerns.",
      likes: 892, createdAt: "4 days ago",
    },
    {
      id: "c2", author: "@devante_trinidad", flag: "🇹🇹",
      title: "Carnival Is Not a Party. It Is a Revolution.",
      body: "Trinidad Carnival began as enslaved Africans mocking their French colonizers. The mock-funeral processions. The painted faces copying white masquerade masks. Every element of carnival was originally subversive. When you watch wining in the street today, you are watching 200 years of resistance encoded in the body. Carnival says: our bodies belong to us. Every year, we say it again.",
      imageDesc: "A woman in full carnival regalia — feathers the color of a sunset, her face proud, her movement total freedom. Port of Spain behind her.",
      likes: 1203, createdAt: "2 days ago",
    },
  ],
  cantonese: [
    {
      id: "ca1", author: "@wing_hk", flag: "🇭🇰",
      title: "Yum Cha Is Not Breakfast. It Is Governance.",
      body: "Dim sum was originally served at teahouses where people discussed politics, settled disputes, and arranged marriages. The tea ceremony — gong fu cha — is a philosophy of patience: heat the pot, warm the cups, pour the first brew away. Nothing is rushed. Everything has sequence. When I observe old-school Cantonese businessmen, I see yum cha logic: the real conversation begins only after the third pot of tea.",
      likes: 445, createdAt: "6 days ago",
    },
  ],
  andean: [
    {
      id: "a1", author: "@inti_quispe", flag: "🇵🇪",
      title: "My Grandmother Weaves the Universe",
      body: "Andean textiles are not decorative. Each pattern — called a tocapu — encodes cosmological information. The number of threads, the direction of the weave, the color sequences — these are a writing system. Spanish colonizers burned the khipus (knotted records) because they understood, correctly, that they were books. My grandmother weaves as her grandmother taught her. She says she is 'writing the family into the cloth.' I believe her completely.",
      imageDesc: "Hands at a loom at 4000 meters altitude. Threads the deep red of cochineal and the blue of Andean sky. The pattern repeats but each repetition is slightly different — like breathing.",
      likes: 334, createdAt: "1 week ago",
    },
  ],
  sahelian: [
    {
      id: "sa1", author: "@moussa_dakar", flag: "🇸🇳",
      title: "Teranga Means You Cannot Leave Hungry",
      body: "In Wolof, teranga means hospitality. But the translation is too thin. Teranga means: if a stranger arrives at my door at midnight, I feed them before asking their name. Teranga means the guest eats first. I grew up watching my mother feed people she had never met and would never see again. When I asked why, she said: 'We feed them because they are here. That is enough reason.' This is not charity. It is cosmology.",
      likes: 278, createdAt: "5 days ago",
    },
  ],
  "hindi-heartland": [
    {
      id: "h1", author: "@priya_delhi", flag: "🇮🇳",
      title: "Holi Is Chemistry and Philosophy",
      body: "The colours of Holi are not random. Gulal was originally made from flowers — tesu, palash — that have antiseptic and cooling properties. Holi falls at the intersection of winter and spring when the body needs these medicines. The water fights cool the body as temperatures rise. Every folk festival encoded practical survival science that colonizers called 'superstition.' We are recovering this knowledge now.",
      likes: 634, createdAt: "3 days ago",
    },
    {
      id: "h2", author: "@arjun_varanasi", flag: "🇮🇳",
      title: "Varanasi Does Not Fear Death",
      body: "In most places, death is hidden. In Varanasi, it burns in the open on the ghats, day and night, for three thousand years without interruption. My father said: look carefully, because this is the only honest place in the world. Everyone who lives here grows comfortable with mortality. That comfort makes them freer. They do not accumulate. They do not panic. They have looked at the truth and kept walking.",
      imageDesc: "The river at dawn. Smoke and water and light. A man carrying marigolds steps into the frame and changes everything about it.",
      likes: 891, createdAt: "1 week ago",
    },
  ],
  nordic: [
    {
      id: "n1", author: "@sigrid_oslo", flag: "🇳🇴",
      title: "What 6 Months of Darkness Teaches You",
      body: "In northern Norway, the sun disappears for months. The first time I explained this to friends from warmer countries, they looked horrified. But polar night is not depression — it is orientation. Without the sun's constant presence, you learn to find light in fire, in candles, in the faces of people you love. The Norse concept of hygge was invented by people who understood that warmth is something you make, not something you find.",
      imageDesc: "A kitchen window in January. Outside: blue Arctic darkness at noon. Inside: a candle, a coffee cup steaming, hands wrapped around it. The contrast is everything.",
      likes: 445, createdAt: "4 days ago",
    },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CultureView({
  act,
  earnPoints,
  openPayment,
  setTab,
  verifiedHuman,
  worldContext,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  openPayment: OpenPayment;
  setTab: (tab: Tab) => void;
  verifiedHuman: VerifiedHuman | null;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  const [view, setView] = useState<"list" | "room" | "create">("list");
  const [activeRoom, setActiveRoom] = useState<CultureRoom | null>(null);
  const [unlockedRooms, setUnlockedRooms] = useState<Set<string>>(
    () => new Set(loadJsonFromStorage<string[]>(storageKeys.unlockedCultures, [])),
  );
  const [createdRooms, setCreatedRooms] = useState<CultureRoom[]>(
    () => loadJsonFromStorage<CultureRoom[]>(storageKeys.createdCultures, []),
  );
  const [userPosts, setUserPosts] = useState<Record<string, CulturePost[]>>(
    () => loadJsonFromStorage(storageKeys.culturePosts, {}),
  );
  const [newPost, setNewPost] = useState({ title: "", body: "" });
  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    () => new Set(loadJsonFromStorage<string[]>(storageKeys.likedCulturePosts, [])),
  );
  const [createForm, setCreateForm] = useState({
    name: "", region: "", flag: "", tagline: "", preview: "", topics: "",
  });

  const handle = verifiedHuman?.username ?? worldContext.username ?? "@preview_human";
  const allRooms = [...createdRooms, ...SEED_ROOMS];

  function enterRoom(room: CultureRoom) {
    if (unlockedRooms.has(room.id)) {
      setActiveRoom(room);
      setView("room");
      return;
    }
    openPayment({
      title: `Enter ${room.name}`,
      amount: room.entryFee,
      detail: `Unlock full access to ${room.name} — curated stories, cultural guides, and posts from verified humans who live this culture.`,
      success: `Welcome to ${room.name}. You now have full access.`,
      feature: "culture-room-entry",
      points: 10,
      onConfirmed: async () => {
        const next = new Set([...unlockedRooms, room.id]);
        setUnlockedRooms(next);
        saveJsonToStorage(storageKeys.unlockedCultures, [...next]);
        setActiveRoom(room);
        setView("room");
        act(`${room.flag} ${room.name} unlocked`, "Full stories and community posts are now visible to you.");
      },
    });
  }

  function launchCreateRoom() {
    const { name, region, tagline } = createForm;
    if (!name.trim() || !region.trim() || !tagline.trim()) {
      act("Missing fields", "Add culture name, region, and tagline to continue.");
      return;
    }
    openPayment({
      title: "Launch Culture Room — 3 WLD",
      amount: "3 WLD",
      detail: `Launch "${name.trim()}" on HumanChain. Verified humans worldwide can discover and pay to enter it.`,
      success: "Culture room is live. Share it to grow your community.",
      feature: "culture-room-create",
      points: 20,
      onConfirmed: async () => {
        const room: CultureRoom = {
          id: `cr-${Date.now()}`,
          name: name.trim(),
          region: region.trim(),
          flag: createForm.flag.trim() || "🌍",
          tagline: tagline.trim(),
          preview: createForm.preview.trim() || `Discover the rich traditions and wisdom of ${name.trim()}. Enter to read stories from verified humans who carry this culture.`,
          topics: createForm.topics.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5),
          members: 1,
          stories: 0,
          entryFee: "2 WLD",
          color: "#137a57",
          creator: handle,
          featured: false,
        };
        const nextCreated = [room, ...createdRooms];
        setCreatedRooms(nextCreated);
        saveJsonToStorage(storageKeys.createdCultures, nextCreated);
        const nextUnlocked = new Set([...unlockedRooms, room.id]);
        setUnlockedRooms(nextUnlocked);
        saveJsonToStorage(storageKeys.unlockedCultures, [...nextUnlocked]);
        setCreateForm({ name: "", region: "", flag: "", tagline: "", preview: "", topics: "" });
        setActiveRoom(room);
        setView("room");
        act(`${room.flag} ${room.name} is live`, "Your culture room is now discoverable by verified humans worldwide.");
      },
    });
  }

  function submitPost() {
    if (!newPost.title.trim() || !newPost.body.trim()) {
      act("Add content", "Write a title and your story before sharing.");
      return;
    }
    if (!activeRoom) return;
    const post: CulturePost = {
      id: `cp-${Date.now()}`,
      author: handle,
      flag: "🌍",
      title: newPost.title.trim(),
      body: newPost.body.trim(),
      likes: 0,
      createdAt: "Just now",
    };
    const roomPosts = userPosts[activeRoom.id] ?? [];
    const capped = [post, ...roomPosts].slice(0, 50);
    const next = { ...userPosts, [activeRoom.id]: capped };
    setUserPosts(next);
    saveJsonToStorage(storageKeys.culturePosts, next);
    setNewPost({ title: "", body: "" });
    act("Story shared", "Your cultural story is live in this room for all members to read.");
    earnPoints(12, "Cultural story contributed.");
  }

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  if (view === "list") {
    const featured = allRooms.filter((r) => r.featured);
    const others = allRooms.filter((r) => !r.featured);

    return (
      <div className="culture-view screen">
        <div className="cv-topbar">
          <button className="cv-back" onClick={() => setTab("home")} type="button">
            <ArrowLeft size={18} />
          </button>
          <strong>Culture Rooms</strong>
          <button className="cv-new-btn" onClick={() => setView("create")} type="button">
            <Plus size={16} /> Create
          </button>
        </div>

        <div className="cv-hero">
          <Globe2 size={26} />
          <div>
            <strong>Living Cultures</strong>
            <span>Stories from verified humans, not textbooks. Pay to enter and learn.</span>
          </div>
        </div>

        {featured.length > 0 && (
          <section className="cv-section">
            <div className="cv-section-head"><strong>Featured</strong></div>
            <div className="cv-rooms-list">
              {featured.map((room) => (
                <RoomCard key={room.id} room={room} unlocked={unlockedRooms.has(room.id)} onEnter={() => enterRoom(room)} />
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section className="cv-section">
            <div className="cv-section-head"><strong>All Rooms</strong></div>
            <div className="cv-rooms-list">
              {others.map((room) => (
                <RoomCard key={room.id} room={room} unlocked={unlockedRooms.has(room.id)} onEnter={() => enterRoom(room)} />
              ))}
            </div>
          </section>
        )}

        <div className="cv-create-cta">
          <Globe2 size={20} />
          <div>
            <strong>Your culture deserves a room</strong>
            <span>Create one for 3 WLD — anyone can enter for 2 WLD</span>
          </div>
          <button onClick={() => setView("create")} type="button">
            <Plus size={14} /> Create
          </button>
        </div>
      </div>
    );
  }

  // ── CREATE VIEW ─────────────────────────────────────────────────────────────
  if (view === "create") {
    return (
      <div className="culture-view screen">
        <div className="cv-topbar">
          <button className="cv-back" onClick={() => setView("list")} type="button">
            <ArrowLeft size={18} />
          </button>
          <strong>Create Culture Room</strong>
          <span />
        </div>

        <div className="cv-create-hero">
          <Globe2 size={34} />
          <strong>Share your culture with the world</strong>
          <span>3 WLD to launch · Members enter for 2 WLD each</span>
        </div>

        <div className="cv-form">
          <div className="cv-field">
            <label>Culture Name *</label>
            <input
              placeholder="e.g. Hausa Heritage, Malay World, Javanese Arts"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              maxLength={60}
            />
          </div>
          <div className="cv-field">
            <label>Region / Country *</label>
            <input
              placeholder="e.g. Northern Nigeria · West Africa"
              value={createForm.region}
              onChange={(e) => setCreateForm((p) => ({ ...p, region: e.target.value }))}
              maxLength={60}
            />
          </div>
          <div className="cv-field cv-field--half">
            <label>Flag Emoji</label>
            <input
              placeholder="🌍"
              value={createForm.flag}
              onChange={(e) => setCreateForm((p) => ({ ...p, flag: e.target.value }))}
              maxLength={4}
            />
          </div>
          <div className="cv-field">
            <label>Tagline *</label>
            <input
              placeholder="One sentence that captures the soul of this culture"
              value={createForm.tagline}
              onChange={(e) => setCreateForm((p) => ({ ...p, tagline: e.target.value }))}
              maxLength={100}
            />
          </div>
          <div className="cv-field">
            <label>Preview <span>(what visitors see before paying)</span></label>
            <textarea
              placeholder="Write a compelling teaser — what makes this culture extraordinary and worth entering?"
              value={createForm.preview}
              onChange={(e) => setCreateForm((p) => ({ ...p, preview: e.target.value }))}
              rows={3}
              maxLength={400}
            />
          </div>
          <div className="cv-field">
            <label>Topics <span>(comma-separated, up to 5)</span></label>
            <input
              placeholder="Language, Food, Music, Spirituality, History"
              value={createForm.topics}
              onChange={(e) => setCreateForm((p) => ({ ...p, topics: e.target.value }))}
              maxLength={150}
            />
          </div>

          <button className="cv-launch-btn" onClick={launchCreateRoom} type="button">
            Launch Culture Room · 3 WLD
          </button>
        </div>
      </div>
    );
  }

  // ── ROOM VIEW ───────────────────────────────────────────────────────────────
  if (view === "room" && activeRoom) {
    const unlocked = unlockedRooms.has(activeRoom.id);
    const seedPosts = SEED_POSTS[activeRoom.id] ?? [];
    const myPosts = userPosts[activeRoom.id] ?? [];
    const allPosts = [...myPosts, ...seedPosts];

    return (
      <div className="culture-view screen">
        <div className="cv-topbar">
          <button className="cv-back" onClick={() => setView("list")} type="button">
            <ArrowLeft size={18} />
          </button>
          <strong>{activeRoom.name}</strong>
          <span className="cv-topbar-flag">{activeRoom.flag}</span>
        </div>

        {/* Room header card */}
        <div className="cv-room-header" style={{ "--room-color": activeRoom.color } as React.CSSProperties}>
          <div className="cv-rh-top">
            <span className="cv-rh-flag">{activeRoom.flag}</span>
            <div className="cv-rh-meta">
              <strong>{activeRoom.name}</strong>
              <span>{activeRoom.region}</span>
            </div>
          </div>
          <p className="cv-rh-tagline">"{activeRoom.tagline}"</p>
          <div className="cv-rh-stats">
            <span><Users size={12} />{(activeRoom.members / 1000).toFixed(1)}k members</span>
            <span><Star size={12} />{activeRoom.stories + myPosts.length} stories</span>
          </div>
          <div className="cv-rh-topics">
            {activeRoom.topics.map((t) => <span key={t}>{t}</span>)}
          </div>
          <span className="cv-rh-creator">Room by {activeRoom.creator}</span>
        </div>

        {/* Post composer */}
        {unlocked && (
          <div className="cv-composer">
            <strong>Share your story</strong>
            <input
              className="cv-composer-title"
              placeholder="Your story title..."
              value={newPost.title}
              onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
              maxLength={80}
            />
            <textarea
              className="cv-composer-body"
              placeholder="Share what this culture means to you — a memory, a tradition, a truth that outsiders miss..."
              value={newPost.body}
              onChange={(e) => setNewPost((p) => ({ ...p, body: e.target.value }))}
              rows={4}
              maxLength={1400}
            />
            <div className="cv-composer-footer">
              <button className="cv-img-btn" type="button"><ImageIcon size={14} /> Add image</button>
              <button className="cv-post-btn" onClick={submitPost} type="button">Share to room</button>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="cv-posts">
          {allPosts.map((post) => (
            <article key={post.id} className="cv-post">
              <div className="cv-post-head">
                <span className="cv-post-flag">{post.flag}</span>
                <span className="cv-post-author">{post.author}</span>
                <span className="cv-post-time">{post.createdAt}</span>
              </div>
              <strong className="cv-post-title">{post.title}</strong>
              <p className="cv-post-body">{post.body}</p>
              {post.imageDesc && (
                <div className="cv-post-img">
                  <ImageIcon size={12} />
                  <span>{post.imageDesc}</span>
                </div>
              )}
              <div className="cv-post-footer">
                <button
                  className={`cv-like-btn${likedPosts.has(post.id) ? " liked" : ""}`}
                  onClick={() => {
                    if (likedPosts.has(post.id)) return;
                    const next = new Set([...likedPosts, post.id]);
                    setLikedPosts(next);
                    saveJsonToStorage(storageKeys.likedCulturePosts, [...next]);
                    earnPoints(1, "Liked a culture story.");
                  }}
                  type="button"
                >
                  {likedPosts.has(post.id) ? "♥" : "♡"} {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                </button>
              </div>
            </article>
          ))}
          {allPosts.length === 0 && (
            <div className="cv-empty">
              <Globe2 size={30} />
              <strong>Be the first to share</strong>
              <span>Write the first story in {activeRoom.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ── Room card sub-component ───────────────────────────────────────────────────

function RoomCard({
  room,
  unlocked,
  onEnter,
}: {
  room: CultureRoom;
  unlocked: boolean;
  onEnter: () => void;
}) {
  return (
    <button
      className={`cv-room-card${unlocked ? " cv-room-card--unlocked" : ""}`}
      style={{ "--room-color": room.color } as React.CSSProperties}
      onClick={onEnter}
      type="button"
    >
      <div className="cvrc-head">
        <span className="cvrc-flag">{room.flag}</span>
        <div className="cvrc-info">
          <strong>{room.name}</strong>
          <span>{room.region}</span>
        </div>
        {unlocked
          ? <span className="cvrc-joined">✓ Joined</span>
          : <span className="cvrc-price"><Lock size={11} />{room.entryFee}</span>
        }
      </div>
      <p className="cvrc-tagline">{room.tagline}</p>
      <p className="cvrc-preview">{room.preview}</p>
      <div className="cvrc-topics">
        {room.topics.slice(0, 4).map((t) => <span key={t}>{t}</span>)}
      </div>
      <div className="cvrc-footer">
        <span><Users size={11} />{(room.members / 1000).toFixed(1)}k</span>
        <span><Star size={11} />{room.stories} stories</span>
        <span className="cvrc-cta">{unlocked ? "Read stories →" : `Enter for ${room.entryFee}`}</span>
      </div>
    </button>
  );
}
