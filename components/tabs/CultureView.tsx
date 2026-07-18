"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  Globe2,
  ImageIcon,
  Lock,
  Plus,
  Star,
  Users,
  X,
} from "lucide-react";
import { loadJsonFromStorage, saveJsonToStorage, storageKeys } from "@/lib/humanchain/storage";
import { isDemoItem } from "@/lib/humanchain/utils";
import { DataBadge } from "@/components/ui/DataBadge";
import { ReportAction } from "@/components/ui/ReportAction";
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
  creatorWallet?: string;
  featured: boolean;
  coverImage?: string;
  coverAlt?: string;
  /** "live" = a real room a verified human paid to create; anything else
   * (including unset) is HumanChain's own curated/demo reference content —
   * see isDemoItem(). Free to browse, no fake byline or engagement count. */
  source?: "demo" | "live";
};

type CulturePost = {
  id: string;
  author: string;
  flag: string;
  title: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  likes: number;
  createdAt: string;
};

// ── Seed data ─────────────────────────────────────────────────────────────────

// HumanChain's own curated reference rooms — not user-submitted, so no fake
// byline or engagement count. Tagged "demo" below (single source of truth).
const RAW_SEED_ROOMS: Array<Omit<CultureRoom, "source">> = [
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
    entryFee: "1 WLD",
    color: "#1a6b40",
    creator: "@adaeze_ng",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1596422405536-a2e11c31b2a5?w=800&h=500&fit=crop&q=80",
    coverAlt: "Yoruba elder woman in traditional aso-oke fabric at a ceremony",
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
    entryFee: "1 WLD",
    color: "#1a4a6b",
    creator: "@mwangi_k",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1591111269990-a3942aaae218?w=800&h=500&fit=crop&q=80",
    coverAlt: "Carved wooden doors of Stone Town at dawn — centuries of Swahili craftsmanship in coral and timber",
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
    entryFee: "1 WLD",
    color: "#6b2a18",
    creator: "@inti_quispe",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1531065208531-4036c933eb6f?w=800&h=500&fit=crop&q=80",
    coverAlt: "Terraced Andean mountainside at Machu Picchu — ancient agricultural engineering that fed millions",
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
    entryFee: "1 WLD",
    color: "#6b1a1a",
    creator: "@wing_hk",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=500&fit=crop&q=80",
    coverAlt: "Bamboo steamers stacked high with har gow and siu mai, tea poured to the side",
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
    entryFee: "1 WLD",
    color: "#1a4a1e",
    creator: "@rasta_t",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=500&fit=crop&q=80",
    coverAlt: "Carnival performer in full feathered regalia of red, gold and purple — pure Caribbean energy",
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
    entryFee: "1 WLD",
    color: "#5a3a12",
    creator: "@moussa_dakar",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?w=800&h=500&fit=crop&q=80",
    coverAlt: "West African bogolan mud cloth — deep earthy blacks and creams in traditional geometric designs",
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
    entryFee: "1 WLD",
    color: "#5a1a6b",
    creator: "@priya_delhi",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e0?w=800&h=500&fit=crop&q=80",
    coverAlt: "Explosion of red and yellow Holi powder against blue sky — pure colour and celebration",
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
    entryFee: "1 WLD",
    color: "#1a2e4a",
    creator: "@sigrid_oslo",
    featured: false,
    coverImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=500&fit=crop&q=80",
    coverAlt: "Northern lights in green and purple above a snow-covered Norwegian fjord village",
  },
];

const SEED_ROOMS: CultureRoom[] = RAW_SEED_ROOMS.map((room) => ({
  ...room,
  source: "demo" as const,
}));

const SEED_POSTS: Record<string, CulturePost[]> = {
  yoruba: [
    {
      id: "y1", author: "@adaeze_ng", flag: "🇳🇬",
      title: "The Proverb That Saved My Marriage",
      body: "\"Ọmọ tí a kò kọ ni yóò jẹ àgbàdo tí a kò fọ\" — The child we don't educate will eat the corn we didn't peel. My grandmother said this to me at my wedding. I thought it was just advice. Fifteen years later I understand she gave me the entire philosophy of Yoruba parenting in one sentence. We don't discipline children because we fear them. We educate them because we respect who they will become.",
      imageUrl: "https://images.unsplash.com/photo-1596422405536-a2e11c31b2a5?w=600&h=350&fit=crop&q=80",
      imageAlt: "Yoruba elder woman in traditional aso-oke fabric at a ceremony",
      likes: 234, createdAt: "2 days ago",
    },
    {
      id: "y2", author: "@tunde_ibadan", flag: "🇳🇬",
      title: "Egungun — What Tourists Miss",
      body: "When the Egungun masquerade appears, he is not a man in costume. He is your ancestor visiting from the other side. The swirling fabric is a portal. Visitors photograph it as performance art. But when my father's Egungun came to our compound, grown men wept. The masquerade called my father's childhood name that nobody alive still remembers. I have no rational explanation. I have only what I witnessed.",
      imageUrl: "https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=600&h=350&fit=crop&q=80",
      imageAlt: "Layers of traditional fabric in deep indigo and gold at a Yoruba cultural ceremony",
      likes: 456, createdAt: "5 days ago",
    },
    {
      id: "y3", author: "@ola_lagos", flag: "🇳🇬",
      title: "Why We Say 'E Kaaro' Not 'Good Morning'",
      body: "In Yoruba, greetings are not pleasantries — they are acknowledgements of existence. E kaaro (morning), E kaasan (afternoon), E kaale (evening) — each one says: I see that you have made it through another cycle. We greet kneeling or prostrating because respect is embodied, not spoken. When my son forgot to greet his grandmother, she went quiet until he understood. The silence taught more than any lecture.",
      likes: 189, createdAt: "1 week ago",
    },
    {
      id: "y4", author: "@kemi_abeokuta", flag: "🇳🇬",
      title: "Ife Bronze: The Oldest Realism in Art History",
      body: "The Ife bronzes were cast in the 12th century — centuries before the European Renaissance. When they reached Europe in the 19th century, scholars refused to believe they were African. They proposed ancient Egyptian origin, Greek influence, anything except the obvious truth: that Yoruba artists had independently mastered naturalistic portraiture while Europeans were still painting flat icons. The bronzes are now in museums. The technology that made them is still passed down in Ife.",
      imageUrl: "https://images.unsplash.com/photo-1603594234564-be6c0fa1ccf7?w=600&h=350&fit=crop&q=80",
      imageAlt: "Ancient Nigerian bronze sculpture showing intricate detail and craftsmanship",
      likes: 521, createdAt: "3 days ago",
    },
  ],
  swahili: [
    {
      id: "s1", author: "@fatuma_mombasa", flag: "🇰🇪",
      title: "Pilau Is Not Rice. Pilau Is a Statement.",
      body: "The Arab traders brought cardamom. The Indian Ocean brought cumin. The Swahili coast added its own soul. When my mother makes pilau for a wedding, she begins three days before. The spices are ground by hand because the electric grinder changes the spirit of the spice, she says. I thought she was being poetic. Then I tasted the difference. The hand-ground pilau carries warmth that no machine produces. It carries her.",
      imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=350&fit=crop&q=80",
      imageAlt: "Fragrant pilau rice with whole spices on a copper serving dish",
      likes: 312, createdAt: "3 days ago",
    },
    {
      id: "s2", author: "@omar_zanzibar", flag: "🇹🇿",
      title: "Stone Town at 4am",
      body: "Before the tourists, before the heat — Stone Town belongs to itself. The call to prayer from three mosques overlapping. The smell of salt and clove. Old men in white kanzus walking paths carved into coral stone by Ottoman-era builders. My grandfather walked these same alleys to the same mosque. The coral stone has absorbed eight centuries of footsteps. This is what we mean when we say Swahili culture is a living archive — the walls themselves remember.",
      imageUrl: "https://images.unsplash.com/photo-1591111269990-a3942aaae218?w=600&h=350&fit=crop&q=80",
      imageAlt: "Carved wooden doors of Stone Town at dawn — centuries of Swahili craftsmanship in coral and timber",
      likes: 567, createdAt: "1 week ago",
    },
    {
      id: "s3", author: "@amina_lamu", flag: "🇰🇪",
      title: "Taarab: The Music the Ocean Made",
      body: "Taarab was born where Africa, Arabia, and India met on the water. The oud, the violin, the accordion — none are originally Swahili. But together, played slowly, with a female singer addressing her rivals in poetic Swahili code, they become something that exists nowhere else on earth. My grandmother could tell you within three notes which singer was in pain, which was triumphant, which was saying what she could never say directly. The music carried everything the language officially couldn't.",
      likes: 388, createdAt: "5 days ago",
    },
    {
      id: "s4", author: "@hassan_mombasa", flag: "🇰🇪",
      title: "Dhow Building: A Living Engineering Tradition",
      body: "On the Swahili coast, master dhow builders work without blueprints. The knowledge lives entirely in their hands, eyes, and the grain of the wood. The jahazi can carry 30 tonnes and has crossed the Indian Ocean for a thousand years. When GPS appeared, fishermen discovered their grandfathers' navigation routes — memorized through stars and currents — were more accurate than the digital charts for local waters. The knowledge encoded in bodies outlasts the knowledge encoded in books.",
      imageUrl: "https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=600&h=350&fit=crop&q=80",
      imageAlt: "Traditional wooden dhow on the Indian Ocean at golden hour, sail full with wind",
      likes: 445, createdAt: "2 days ago",
    },
  ],
  caribbean: [
    {
      id: "c1", author: "@kezia_kingston", flag: "🇯🇲",
      title: "What Bob Never Told You About Rastafari",
      body: "Rastafari is not a music genre. It is a complete epistemology — a way of knowing the world. Ital food is not a diet, it is a refusal of systems that commodify life. The locked hair is not a style, it is a covenant with nature. The movement predicted corporate food harm, surveillance states, and the commodification of Black identity — decades before these were mainstream concerns.",
      imageUrl: "https://images.unsplash.com/photo-1562201526-1952e4d5e36b?w=600&h=350&fit=crop&q=80",
      imageAlt: "Lush green hills of Jamaica at sunrise, morning mist in the Blue Mountains",
      likes: 892, createdAt: "4 days ago",
    },
    {
      id: "c2", author: "@devante_trinidad", flag: "🇹🇹",
      title: "Carnival Is Not a Party. It Is a Revolution.",
      body: "Trinidad Carnival began as enslaved Africans mocking their French colonizers. The mock-funeral processions. The painted faces copying white masquerade masks. Every element of carnival was originally subversive. When you watch wining in the street today, you are watching 200 years of resistance encoded in the body. Carnival says: our bodies belong to us. Every year, we say it again.",
      imageUrl: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&h=350&fit=crop&q=80",
      imageAlt: "Carnival performer in full feathered regalia of red, gold and purple — pure Caribbean energy",
      likes: 1203, createdAt: "2 days ago",
    },
    {
      id: "c3", author: "@marcia_barbados", flag: "🇧🇧",
      title: "Flying Fish: The Dish That Built a Nation",
      body: "Barbados is the only country in the world where flying fish is a national symbol. But it's not nostalgia. Flying fish season still runs from December to June. The fish actually fly — gliding 200 metres above water to escape predators. Bajans eat them fried, stewed, steamed. The national dish, cou-cou and flying fish, is the same meal enslaved Bajan people were given in the 1700s. We transformed survival food into cultural pride. That transformation is itself the lesson.",
      likes: 534, createdAt: "6 days ago",
    },
    {
      id: "c4", author: "@rupert_guyana", flag: "🇬🇾",
      title: "Steelpan Was Born from a Ban",
      body: "In 1880s Trinidad, the British colonial government banned African drumming. So Trinidadians switched to bamboo. When they banned that too, Trinidadians discovered that discarded oil drums — the byproduct of the petroleum industry colonialism built — could be tuned to play melody. The steelpan is the only acoustic instrument invented in the 20th century. It was invented by people who were not allowed to make music, which is why it is the most joyful instrument ever made.",
      imageUrl: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=350&fit=crop&q=80",
      imageAlt: "Rows of gleaming steel pans in a panyard, Port of Spain, Trinidad",
      likes: 678, createdAt: "3 days ago",
    },
  ],
  cantonese: [
    {
      id: "ca1", author: "@wing_hk", flag: "🇭🇰",
      title: "Yum Cha Is Not Breakfast. It Is Governance.",
      body: "Dim sum was originally served at teahouses where people discussed politics, settled disputes, and arranged marriages. The tea ceremony — gong fu cha — is a philosophy of patience: heat the pot, warm the cups, pour the first brew away. Nothing is rushed. Everything has sequence. When I observe old-school Cantonese businessmen, I see yum cha logic: the real conversation begins only after the third pot of tea.",
      imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=350&fit=crop&q=80",
      imageAlt: "Bamboo steamers stacked high with har gow and siu mai, tea poured to the side",
      likes: 445, createdAt: "6 days ago",
    },
    {
      id: "ca2", author: "@ming_guangzhou", flag: "🇨🇳",
      title: "Nine Tones — What Cantonese Sounds Like to Us",
      body: "Mandarin has four tones. Cantonese has nine. What this means practically is that the same syllable can carry nine different meanings depending on pitch. Cantonese poetry and opera exploit this to create double and triple meanings simultaneously. When my father sings old Cantopop lyrics, he hears love poems, political commentary, and folk wisdom in the same phrase. It is a language designed for layers. That is why it survived every attempt to replace it.",
      likes: 389, createdAt: "4 days ago",
    },
    {
      id: "ca3", author: "@cecilia_hk", flag: "🇭🇰",
      title: "Wonton Noodles: A Bowl That Takes Years to Make",
      body: "A proper wonton noodle soup requires shrimp paste made from prawns dried in mountain wind, noodles pulled until they bounce, and a broth simmered for 16 hours from dried flounder and pork bones. The wontons are wrapped so the filling doesn't touch the water during cooking. My sifu taught me this for two years before letting me near the broth. There are restaurants in Hong Kong where the chef is 80 and refuses to retire because no one has learned correctly yet.",
      imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&h=350&fit=crop&q=80",
      imageAlt: "Clear golden wonton noodle soup in a classic Cantonese bowl, spring onion on top",
      likes: 712, createdAt: "1 week ago",
    },
    {
      id: "ca4", author: "@anson_diaspora", flag: "🇺🇸",
      title: "Why I Insist on Cantonese in San Francisco",
      body: "My grandparents came through Angel Island in 1923, speaking only Cantonese. When Cantonese was banned in schools, they still spoke it at home. When Mandarin became the prestige dialect, they still spoke Cantonese at the market. The language is not just communication — it is a thread connecting me to them and to Guangdong and to every generation that refused to let it die. Every sentence I speak in Cantonese is an act of remembrance. I will not let it become only an old person's language.",
      likes: 823, createdAt: "2 days ago",
    },
  ],
  andean: [
    {
      id: "a1", author: "@inti_quispe", flag: "🇵🇪",
      title: "My Grandmother Weaves the Universe",
      body: "Andean textiles are not decorative. Each pattern — called a tocapu — encodes cosmological information. The number of threads, the direction of the weave, the color sequences — these are a writing system. Spanish colonizers burned the khipus (knotted records) because they understood, correctly, that they were books. My grandmother weaves as her grandmother taught her. She says she is 'writing the family into the cloth.' I believe her completely.",
      imageUrl: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&h=350&fit=crop&q=80",
      imageAlt: "Andean woman weaving on a traditional loom at 4000 metres, deep reds and golds in the thread",
      likes: 334, createdAt: "1 week ago",
    },
    {
      id: "a2", author: "@rosa_cusco", flag: "🇵🇪",
      title: "Pachamama Is Not a Metaphor",
      body: "On August 1st across the Andes, people open the earth and feed her — coca leaves, chicha, llama fat, flowers. This is not a ritual for tourists. My uncle, who has a PhD in engineering, performs the ceremony every year. He says Pachamama is the understanding that soil has rights, water has memory, and mountains have consciousness. The Andean cosmovision had sustainability frameworks when Europe was clear-cutting its forests. We call it tradition. The West is only now calling it ecology.",
      imageUrl: "https://images.unsplash.com/photo-1531065208531-4036c933eb6f?w=600&h=350&fit=crop&q=80",
      imageAlt: "Terraced Andean mountainside at Machu Picchu — ancient agricultural engineering that fed millions",
      likes: 567, createdAt: "4 days ago",
    },
    {
      id: "a3", author: "@yupanqui_bolivia", flag: "🇧🇴",
      title: "The Khipu Speaks Again",
      body: "A khipu is a system of knotted cords. For centuries scholars thought they were accounting tools — census data, tax records. Recent research shows they encode narrative. Linguists have found khipus that appear to tell stories. The Inca had writing — just not a writing that looked like writing. We are currently decoding a library of thousands of khipus that survived conquest. We may be about to hear the Inca speak in their own words for the first time in 500 years.",
      likes: 891, createdAt: "3 days ago",
    },
    {
      id: "a4", author: "@marisol_ecuador", flag: "🇪🇨",
      title: "Ikat: When the Thread Is Dyed Before the Weave",
      body: "In Otavalo, Ecuador, weavers dye threads in specific patterns before the cloth is assembled. The final design only emerges when weaving is complete — the weaver must hold the entire finished image in mind while working thread by thread. This is called ikat and it requires a kind of spatial intelligence that no school teaches. My 16-year-old cousin can do it perfectly. She has never had a math lesson but she thinks in five dimensions simultaneously.",
      imageUrl: "https://images.unsplash.com/photo-1503023345310-e44b703ae27b?w=600&h=350&fit=crop&q=80",
      imageAlt: "Vibrant Otavalo ikat textile in geometric patterns — each colour field planned before a thread was woven",
      likes: 423, createdAt: "5 days ago",
    },
  ],
  sahelian: [
    {
      id: "sa1", author: "@moussa_dakar", flag: "🇸🇳",
      title: "Teranga Means You Cannot Leave Hungry",
      body: "In Wolof, teranga means hospitality. But the translation is too thin. Teranga means: if a stranger arrives at my door at midnight, I feed them before asking their name. Teranga means the guest eats first. I grew up watching my mother feed people she had never met and would never see again. When I asked why, she said: 'We feed them because they are here. That is enough reason.' This is not charity. It is cosmology.",
      imageUrl: "https://images.unsplash.com/photo-1561328399-f94d2de78605?w=600&h=350&fit=crop&q=80",
      imageAlt: "Large communal meal in Dakar — thiéboudienne in a shared bowl, hands reaching from all sides",
      likes: 278, createdAt: "5 days ago",
    },
    {
      id: "sa2", author: "@fatou_mali", flag: "🇲🇱",
      title: "The Griot Remembers Everything You Forgot",
      body: "A griot does not just sing — they are a living database. Every family, every village, every lineage has a griot who knows every name going back twenty generations. When there was a dispute over land in my village, the elder called the griot rather than a lawyer. The griot recited, from memory, who built which wall, who married whose daughter, who gave which plot as dowry — all 150 years ago. The court ruled based on the griot's testimony. Written records had errors. The griot did not.",
      likes: 445, createdAt: "3 days ago",
    },
    {
      id: "sa3", author: "@ibrahim_burkina", flag: "🇧🇫",
      title: "Bogolan: Mud Cloth Is a Love Letter to the Land",
      body: "Bogolan is made by dyeing cotton with fermented mud — the iron-rich clay of the Niger River. The mud reacts with the plant-dye base to produce deep blacks and browns that cannot be replicated industrially. Each piece takes months. The patterns are not decorative — they record events, communicate social status, carry protection. When Malian hunters wore bogolan into the bush, they were wearing armor the land itself made. You cannot separate the cloth from the earth that created it.",
      imageUrl: "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?w=600&h=350&fit=crop&q=80",
      imageAlt: "West African bogolan mud cloth — deep earthy blacks and creams in traditional geometric designs",
      likes: 534, createdAt: "1 week ago",
    },
    {
      id: "sa4", author: "@aminata_senegal", flag: "🇸🇳",
      title: "Sufi Music at Midnight in Touba",
      body: "During the Grand Magal pilgrimage, 5 million people converge on Touba, Senegal. At midnight, in courtyards across the city, Sufi brotherhoods chant. The dhikr — the repetition of divine names — goes for hours. I am not religious. But I have stood inside a Mouride dhikr circle and felt the vibration in my sternum as 200 voices synchronized. There is something the body understands about collective sound that the mind cannot explain. Sufism knew this first.",
      likes: 389, createdAt: "4 days ago",
    },
  ],
  "hindi-heartland": [
    {
      id: "h1", author: "@priya_delhi", flag: "🇮🇳",
      title: "Holi Is Chemistry and Philosophy",
      body: "The colours of Holi are not random. Gulal was originally made from flowers — tesu, palash — that have antiseptic and cooling properties. Holi falls at the intersection of winter and spring when the body needs these medicines. The water fights cool the body as temperatures rise. Every folk festival encoded practical survival science that colonizers called 'superstition.' We are recovering this knowledge now.",
      imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e0?w=600&h=350&fit=crop&q=80",
      imageAlt: "Explosion of red and yellow Holi powder against blue sky — pure colour and celebration",
      likes: 634, createdAt: "3 days ago",
    },
    {
      id: "h2", author: "@arjun_varanasi", flag: "🇮🇳",
      title: "Varanasi Does Not Fear Death",
      body: "In most places, death is hidden. In Varanasi, it burns in the open on the ghats, day and night, for three thousand years without interruption. My father said: look carefully, because this is the only honest place in the world. Everyone who lives here grows comfortable with mortality. That comfort makes them freer. They do not accumulate. They do not panic. They have looked at the truth and kept walking.",
      imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=350&fit=crop&q=80",
      imageAlt: "Varanasi ghats at sunrise — boats on the Ganges, priests at the water, temple spires above",
      likes: 891, createdAt: "1 week ago",
    },
    {
      id: "h3", author: "@deepa_jaipur", flag: "🇮🇳",
      title: "Kathak Encodes 1,200 Years of North Indian History",
      body: "Kathak is a classical dance form that tells you exactly what happened when Hindus, Muslims, and Mughals met. The footwork is temple devotion. The gestures are Sanskrit storytelling. The spins — the chakkar — came from Sufi whirling. The courtesan tradition preserved it when temples were closed. Bollywood cheapened it; its masters are returning it to its complexity. When a Kathak dancer performs the 'thumri', they are simultaneously in three centuries at once.",
      imageUrl: "https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=600&h=350&fit=crop&q=80",
      imageAlt: "Kathak dancer mid-spin in gold and red costume, bells on ankles, expressing classical mudra",
      likes: 723, createdAt: "2 days ago",
    },
    {
      id: "h4", author: "@ravi_lucknow", flag: "🇮🇳",
      title: "Biryani Is Diplomacy in a Pot",
      body: "Awadhi biryani was developed in the royal kitchens of Lucknow to feed an army — literally. The dum pukht technique (sealed vessel, slow steam) was invented because cooking food over an open fire for a camp of 10,000 soldiers produces inferior results. The seal preserved moisture, the slow steam married spices into the rice. The cooks were given full creative authority. The result was a dish so political that even today which biryani style you prefer in India tells people where you stand on multiple social questions.",
      likes: 1087, createdAt: "5 days ago",
    },
  ],
  nordic: [
    {
      id: "n1", author: "@sigrid_oslo", flag: "🇳🇴",
      title: "What 6 Months of Darkness Teaches You",
      body: "In northern Norway, the sun disappears for months. The first time I explained this to friends from warmer countries, they looked horrified. But polar night is not depression — it is orientation. Without the sun's constant presence, you learn to find light in fire, in candles, in the faces of people you love. The Norse concept of hygge was invented by people who understood that warmth is something you make, not something you find.",
      imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=350&fit=crop&q=80",
      imageAlt: "Northern lights in green and purple above a snow-covered Norwegian fjord village",
      likes: 445, createdAt: "4 days ago",
    },
    {
      id: "n2", author: "@erik_sweden", flag: "🇸🇪",
      title: "Midsommar Is Not a Horror Movie",
      body: "Every summer, Swedes dance around a pole decorated with flowers and greenery, sing children's songs, and stay up until the sun barely sets. The outside world finds this either quaint or sinister. We find it necessary. After months of darkness, the light must be celebrated with your whole body — not watched through a window. Midsommar is a full surrender to the warmth. You dance because if you don't use your body to mark the longest day, it slips past and you've wasted it.",
      imageUrl: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&h=350&fit=crop&q=80",
      imageAlt: "Swedish midsommar maypole decorated with wildflowers in a green meadow, long evening light",
      likes: 612, createdAt: "2 days ago",
    },
    {
      id: "n3", author: "@aino_finland", flag: "🇫🇮",
      title: "The Finnish Sauna Is a Church",
      body: "In Finland, there are more saunas than cars. A sauna is not a wellness amenity — it is where Finns make decisions, heal relationships, give birth, and prepare the dead. Business deals are finalised in saunas. Therapy happens in saunas. The rule is equality: in the heat, rank disappears, clothing is gone, and everyone is equally vulnerable. There is a Finnish saying: if you can't solve something in the sauna, you can't solve it. I have found this to be exactly true.",
      imageUrl: "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?w=600&h=350&fit=crop&q=80",
      imageAlt: "Traditional Finnish smoke sauna on a lake shore at dusk — steam rising into cool forest air",
      likes: 789, createdAt: "6 days ago",
    },
    {
      id: "n4", author: "@lars_denmark", flag: "🇩🇰",
      title: "New Nordic Cuisine Is Ancient Nordic Science",
      body: "When René Redzepi started fermenting and foraging at Noma, the food world called it revolutionary. My grandmother called it Tuesday. Nordic peoples have been fermenting herring, foraging mushrooms, preserving cloudberries, and curing meat with salt and smoke for 3,000 years. What changed is that these techniques entered fine dining and suddenly they required explanation. The real story is simpler: northern winters are long and the food must last. Necessity invented flavour.",
      likes: 534, createdAt: "1 week ago",
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
  const [newPost, setNewPost] = useState({ title: "", body: "", imageUrl: "" });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(
    () => new Set(loadJsonFromStorage<string[]>(storageKeys.likedCulturePosts, [])),
  );
  const [createForm, setCreateForm] = useState({
    name: "", region: "", flag: "", tagline: "", preview: "", topics: "",
  });

  const handle = verifiedHuman?.username ?? worldContext.username ?? "@preview_human";
  const allRooms = [...createdRooms, ...SEED_ROOMS];

  function enterRoom(room: CultureRoom) {
    if (unlockedRooms.has(room.id) || isDemoItem(room)) {
      // Curated/demo rooms are free to browse — there's no real human on the
      // other end of a "creator" fee for reference content HumanChain wrote.
      setActiveRoom(room);
      setView("room");
      return;
    }
    openPayment({
      title: `Enter ${room.name}`,
      amount: room.entryFee,
      detail: `1 WLD paid to HumanChain treasury. Unlocks full access to ${room.name} — stories, cultural guides, and posts from verified humans who live this culture.`,
      success: `Welcome to ${room.name}. You now have full access.`,
      feature: "culture-room-entry",
      points: 10,
      context: { creatorHandle: room.creator, creatorWallet: room.creatorWallet },
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
      detail: `3 WLD paid to HumanChain treasury. "${name.trim()}" goes live — verified humans can pay 1 WLD to enter and entry fees are tracked for creator payouts.`,
      success: "Culture room is live. Verified humans can now pay to enter.",
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
          entryFee: "1 WLD",
          color: "#137a57",
          creator: handle,
          creatorWallet: verifiedHuman?.wallet,
          featured: false,
          source: "live",
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
      ...(newPost.imageUrl ? { imageUrl: newPost.imageUrl, imageAlt: newPost.title.trim() } : {}),
      likes: 0,
      createdAt: "Just now",
    };
    const roomPosts = userPosts[activeRoom.id] ?? [];
    const capped = [post, ...roomPosts].slice(0, 50);
    const next = { ...userPosts, [activeRoom.id]: capped };
    setUserPosts(next);
    saveJsonToStorage(storageKeys.culturePosts, next);
    setNewPost({ title: "", body: "", imageUrl: "" });
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
            <span>Curated reference rooms, free to browse — or create your own for verified humans to enter.</span>
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
            <span>Create one for 3 WLD — anyone can enter for 1 WLD</span>
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
          <span>3 WLD to launch · Members enter for 1 WLD each</span>
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
    // Seed posts are HumanChain's own editorial writing, not real member
    // submissions — their bylines and like counts must say so, not imply a
    // platform member who doesn't exist.
    const seedPostIds = new Set(seedPosts.map((p) => p.id));

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
        <div
          className={`cv-room-header${activeRoom.coverImage ? " cv-room-header--photo" : ""}`}
          style={{
            "--room-color": activeRoom.color,
            ...(activeRoom.coverImage ? { backgroundImage: `url(${activeRoom.coverImage})` } : {}),
          } as React.CSSProperties}
        >
          <div className="cv-rh-top">
            <span className="cv-rh-flag">{activeRoom.flag}</span>
            <div className="cv-rh-meta">
              <strong>{activeRoom.name}</strong>
              <span>{activeRoom.region}</span>
            </div>
          </div>
          <p className="cv-rh-tagline">&quot;{activeRoom.tagline}&quot;</p>
          {isDemoItem(activeRoom) ? (
            <div className="cv-rh-stats">
              <DataBadge label="Curated" />
            </div>
          ) : (
            <div className="cv-rh-stats">
              <span><Users size={12} />{(activeRoom.members / 1000).toFixed(1)}k members</span>
              <span><Star size={12} />{activeRoom.stories + myPosts.length} stories</span>
            </div>
          )}
          <div className="cv-rh-topics">
            {activeRoom.topics.map((t) => <span key={t}>{t}</span>)}
          </div>
          <span className="cv-rh-creator">
            {isDemoItem(activeRoom) ? "Curated by HumanChain — reference content, not a platform member" : `Room by ${activeRoom.creator}`}
          </span>
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
            {newPost.imageUrl && (
              <div className="cv-img-preview">
                <img src={newPost.imageUrl} alt="Preview" />
                <button
                  className="cv-img-remove"
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setNewPost((p) => ({ ...p, imageUrl: "" }))}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="cv-composer-footer">
              <button
                className="cv-img-btn"
                type="button"
                aria-label="Add image"
                onClick={() => photoInputRef.current?.click()}
              >
                <ImageIcon size={14} /> Add image
              </button>
              <button className="cv-post-btn" onClick={submitPost} type="button">Share to room</button>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              aria-hidden="true"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                setNewPost((p) => ({ ...p, imageUrl: url }));
                e.target.value = "";
              }}
            />
          </div>
        )}

        {/* Posts */}
        <div className="cv-posts">
          {allPosts.map((post) => (
            <article key={post.id} className="cv-post">
              <div className="cv-post-head">
                <span className="cv-post-flag">{post.flag}</span>
                <span className="cv-post-author">
                  {seedPostIds.has(post.id) ? "Editorial reference — not a platform member" : post.author}
                </span>
                <span className="cv-post-time">{post.createdAt}</span>
              </div>
              <strong className="cv-post-title">{post.title}</strong>
              {post.imageUrl && (
                <img
                  alt={post.imageAlt ?? post.title}
                  className="cv-post-photo"
                  src={post.imageUrl}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <p className="cv-post-body">{post.body}</p>
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
                  {seedPostIds.has(post.id)
                    ? (likedPosts.has(post.id) ? "♥ Liked" : "♡ Like")
                    : `${likedPosts.has(post.id) ? "♥" : "♡"} ${post.likes + (likedPosts.has(post.id) ? 1 : 0)}`}
                </button>
                {!seedPostIds.has(post.id) && (
                  <ReportAction
                    onReported={(reason) => act("Report submitted", `"${reason}" report sent to moderation.`)}
                    reporterWallet={verifiedHuman?.wallet}
                    targetId={post.id}
                    targetType="culture-post"
                  />
                )}
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
      className={`cv-room-card${unlocked ? " cv-room-card--unlocked" : ""}${room.coverImage ? " cv-room-card--photo" : ""}`}
      style={{ "--room-color": room.color } as React.CSSProperties}
      onClick={onEnter}
      type="button"
    >
      {room.coverImage ? (
        <div className="cvrc-cover">
          <img
            alt={room.coverAlt ?? room.name}
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            src={room.coverImage}
          />
          <div className="cvrc-cover-shade" />
          <span className="cvrc-cover-flag">{room.flag}</span>
          {isDemoItem(room)
            ? <DataBadge className="cvrc-price--onphoto" label="Curated" />
            : unlocked
              ? <span className="cvrc-joined cvrc-joined--onphoto">✓ Joined</span>
              : <span className="cvrc-price cvrc-price--onphoto"><Lock size={11} />{room.entryFee}</span>
          }
          <div className="cvrc-cover-meta">
            <strong>{room.name}</strong>
            <span>{room.region}</span>
          </div>
        </div>
      ) : (
        <div className="cvrc-head">
          <span className="cvrc-flag">{room.flag}</span>
          <div className="cvrc-info">
            <strong>{room.name}</strong>
            <span>{room.region}</span>
          </div>
          {isDemoItem(room)
            ? <DataBadge label="Curated" />
            : unlocked
              ? <span className="cvrc-joined">✓ Joined</span>
              : <span className="cvrc-price"><Lock size={11} />{room.entryFee}</span>
          }
        </div>
      )}
      <p className="cvrc-tagline">{room.tagline}</p>
      <p className="cvrc-preview">{room.preview}</p>
      <div className="cvrc-topics">
        {room.topics.slice(0, 4).map((t) => <span key={t}>{t}</span>)}
      </div>
      <div className="cvrc-footer">
        {isDemoItem(room) ? null : (
          <>
            <span><Users size={11} />{(room.members / 1000).toFixed(1)}k</span>
            <span><Star size={11} />{room.stories} stories</span>
          </>
        )}
        <span className="cvrc-cta">
          {isDemoItem(room) ? "Browse — free →" : unlocked ? "Read stories →" : `Enter for ${room.entryFee}`}
        </span>
      </div>
    </button>
  );
}
