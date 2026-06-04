"use client";

import { BookOpen, Library, ShieldCheck, Upload, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import {
  humanChainErrorStates,
  validateStoryFile,
} from "@/lib/humanchainPolicy";
import {
  loadJsonFromStorage,
  saveJsonToStorage,
  storageKeys,
} from "@/lib/humanchain/storage";
import {
  formatShortTime,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { TopBar } from "@/components/layout/TopBar";
import type { StoryArtKind, StoryImage, UserStory } from "@/types/content";
import type { EarnPoints, OpenPayment } from "@/types/ui";
import type { HumanIdentity } from "@/types/user";
import type { HistoryRecord } from "@/types/reputation";

// ─── story data ──────────────────────────────────────────────────────────────

const monthlyStoryCover = "/images/story-cover-door-color.png";

const bitcoinStoryPhotos = [
  "/images/story-cover-bitcoin-color.png",
  "/images/story-scene-bitcoin-network-color.png",
  "/images/story-scene-bitcoin-key-color.png",
];

const orbStoryPhotos = [
  "/images/story-cover-orb-color.png",
  "/images/story-scene-orb-verify-color.png",
];

const onePageStoryPhotos = [
  "/images/story-cover-onepage-color.png",
  "/images/story-scene-onepage-write-color.png",
];

const publishedStoryImagePages = new Set([0, 3, 6]);
const monthlyStoryImagePages = new Set([0, 4, 8, 12, 16, 20, 24, 28]);

const storyImageByPage: Record<number, StoryImage> = {
  1: {
    alt: "A closed door with a small line of light under it",
    art: "closed-door",
  },
  2: {
    alt: "A key, train ticket, and cracked cup on a table",
    art: "key-ticket",
  },
  5: {
    alt: "A cracked cup repaired with a golden line",
    art: "repaired-cup",
  },
  7: {
    alt: "A small ink mark beside a stair-shaped path",
    art: "stair-symbol",
  },
  9: {
    alt: "A glowing phone holding an honest invisible message",
    art: "honest-message",
  },
  10: {
    alt: "A phone releasing a thread into the world",
    art: "phone-thread",
  },
  14: {
    alt: "An elderly woman at a kitchen table remembering names",
    art: "memory-table",
  },
  22: {
    alt: "A kind reply moving across the world like a ribbon",
    art: "reply-ribbon",
  },
  18: {
    alt: "A small window opening to city air",
    art: "open-window",
  },
  27: {
    alt: "A repair shop counter with a notebook, radio parts, and an unanswered phone",
    art: "repair",
  },
  34: {
    alt: "A door opened slightly with a plant outside",
    art: "plant-door",
  },
  37: {
    alt: "A small tree growing from a cracked wall",
    art: "cracked-tree",
  },
  43: {
    alt: "A private anonymous question floating above a city at night",
    art: "anonymous",
  },
  48: {
    alt: "A phone call crossing rain between repair tools",
    art: "repair-call",
  },
  51: {
    alt: "A small apartment table with phones, tea, and handwritten notes from different languages",
    art: "notes",
  },
  64: {
    alt: "A cracked cup repaired with a gold line",
    art: "repaired-cup",
  },
  67: {
    alt: "A blue door opening for ten minutes",
    art: "open-door",
  },
  72: {
    alt: "A global wall of small portraits and voice waves glowing softly",
    art: "voice-wall",
  },
  76: {
    alt: "A broken streak reconnecting",
    art: "broken-streak",
  },
  81: {
    alt: "Two distant countries represented by windows lit in cold and warm cities",
    art: "windows",
  },
  93: {
    alt: "People in different countries looking at the same sunrise through windows",
    art: "sunrise-windows",
  },
  101: {
    alt: "A Human Verdict made from many doors",
    art: "verdict-mirror",
  },
  106: {
    alt: "A future technology question represented by humans around a soft transparent screen",
    art: "future-screen",
  },
  118: {
    alt: "A quiet futuristic public square where strangers read human messages",
    art: "public-square",
  },
  129: {
    alt: "A phone with one percent battery glowing in a dark hospital room",
    art: "low-battery",
  },
  136: {
    alt: "The final Human Verdict as a mirror assembled from many rooms",
    art: "verdict-mirror",
  },
  142: {
    alt: "A small opening where light enters",
    art: "light-opening",
  },
  149: {
    alt: "A reader adding their own link to the global chain",
    art: "add-link",
  },
};

const globalStoryChapters = [
  [
    "MONTHLY HUMAN STORY: The Door That Waited. Every city has a door people pass without seeing. This one was blue, scratched near the handle, and locked from the inside.",
    "Inside lived Mara, a woman who had once been easy to love because she was always useful. She remembered birthdays, sent money, answered calls, and never let anyone hear the tired part of her voice.",
    "Then her father died, her work changed, and her body began refusing the life her pride had accepted. One Tuesday, Mara stopped opening the blue door.",
    "At first, people called. Then they messaged. Then they became careful. Careful people say things like take your time when they are also beginning to leave.",
    "Mara kept three objects on the table: a key she did not use, a train ticket she never refunded, and a cup with a crack through the middle.",
    "The key was for the door. The ticket was for the city she had planned to leave. The cup was from her father, who believed broken things should be tested before they were thrown away.",
    "For twelve days, Mara lived in small circles: bed, sink, table, window, door. Outside, the world kept performing its loud confidence.",
    "On the thirteenth day, a child pushed a folded paper under the blue door. It said only: I watered your plant because it looked lonely too.",
    "Human message: sometimes life returns as a small kindness that does not ask you to explain yourself.",
    "Mara did not open the door. But she moved the plant closer to the light.",
  ],
  [
    "The next morning, another paper arrived. This one had a drawing of a sun wearing shoes. Under it, the child wrote: today the sun is trying.",
    "Mara laughed once. The sound surprised her. It had been living somewhere behind the grief, waiting for a foolish enough reason.",
    "She found a pencil and wrote back: tell the sun I respect the effort.",
    "The reply disappeared under the door within minutes. For the first time in weeks, the hallway became a place with a heartbeat.",
    "The child was named Lio. Mara learned this from the third note, which included a serious complaint about carrots.",
    "Lio did not ask what was wrong. This made him better company than most adults.",
    "On day four, he wrote: my grandmother says people become quiet when their hearts are carrying furniture.",
    "Mara stared at that sentence for a long time. It was ridiculous. It was exact.",
    "She opened HumanChain and saved it as a private link: hearts can carry furniture.",
    "Human message: a child can sometimes name your pain because they have not yet learned to make language polite.",
  ],
  [
    "The app asked that week: What helped you open a door again? Mara did not answer. She read.",
    "A man in Mexico wrote: I opened the door when hunger became stronger than shame.",
    "A teacher in Korea wrote: my students left drawings on the floor until I wanted to see who made them.",
    "A mother in Ghana wrote: I opened because my son knocked in rhythm with a song from when he was little.",
    "A student in Germany wrote: I never opened. I moved through the window of someone else's patience.",
    "Mara saved that one. It sounded like a joke until it became a map.",
    "She looked at the window. It opened to a narrow fire escape and three pots of dry basil.",
    "The blue door still felt impossible. But the window was smaller. Smaller things are sometimes more honest beginnings.",
    "She opened it two inches. The city entered as cold air and a motorcycle passing below.",
    "Human message: when the door is too much, begin with the window.",
  ],
  [
    "Lio's notes became a calendar. Monday was the sun. Tuesday was a question about whether clouds were tired. Wednesday was a drawing of a cup with armor.",
    "Mara understood the cup immediately. She touched the cracked one on her table.",
    "Her father had repaired radios, chairs, umbrellas, watches, and once, badly, a marriage between two neighbors who only needed someone to make them sit down.",
    "He used to say: broken is not a verdict. Broken is a request for attention.",
    "Mara hated that sentence after he died. It made grief sound practical, and grief had no interest in being useful.",
    "Still, she washed the cracked cup and placed it beside the key.",
    "That night she asked HumanChain privately: how do you return to people after disappearing?",
    "She paid for a Deep Human Verdict because she wanted more than comfort. She wanted instructions that did not insult the size of the silence.",
    "The answers came from people who had vanished, waited, forgiven, refused, returned, and been returned to.",
    "Human message: return does not begin with a speech. It begins with one true sentence sent without demanding rescue.",
  ],
  [
    "The verdict gave her four steps: name the silence, do not overexplain, offer one next action, accept that some doors may now be closed to you.",
    "Mara wrote the sentence on paper first: I disappeared because grief made every conversation feel like lifting furniture.",
    "She crossed it out. Too poetic.",
    "She wrote: I am sorry I went quiet. I was not well. I can answer one message today.",
    "It looked small. It looked almost embarrassingly plain. That was why it was honest.",
    "She sent it to her sister.",
    "For six minutes, nothing happened. Mara watched the phone as if it were a dangerous animal.",
    "Then her sister replied: one message is enough. Are you eating?",
    "Mara cried because the question was ordinary. Ordinary mercy is often the kind that finally reaches us.",
    "Human message: the right person will not always need your whole explanation before offering you soup.",
  ],
  [
    "The next day, Mara unlocked the blue door but did not open it. The sound of the lock turning felt dramatic, so she turned it again, just to prove it could become ordinary.",
    "Lio slid a note under: I heard the door think about opening.",
    "Mara wrote back: the door is shy.",
    "He replied: tell it I am also shy but I still go to school.",
    "This was unfairly persuasive.",
    "At noon, Mara opened the door as wide as her foot. The hallway smelled like dust, laundry soap, and someone's lunch.",
    "A small plant sat outside, watered and leaning toward her apartment as if trying to listen.",
    "There was no crowd. No judgment. No soundtrack. Just the world, still there after all her absence.",
    "She brought the plant inside and placed it by the cracked cup.",
    "Human message: returning is rarely cinematic. Mostly, it is a foot in the doorway and a plant that survived.",
  ],
  [
    "That evening, Mara read HumanChain's monthly story archive. She noticed how many stories were not about winning but about staying reachable.",
    "A farmer wrote about drought. A nurse wrote about burnout. A father wrote about apology. A teenager wrote about being afraid of becoming ordinary.",
    "The stories did not make suffering beautiful. They made it less private.",
    "Mara added her first public link: I opened the window before I opened the door.",
    "Within an hour, people from nineteen countries saved it.",
    "Someone tipped 1 WLD and wrote: this is the only advice I can use today.",
    "Mara did not feel proud. Pride was too large. She felt connected by one thin, believable thread.",
    "Lio knocked once, then ran away. On the floor was a final note for the week: congratulations to the window.",
    "Mara taped it above the table.",
    "Human message: a sentence can become a handle for someone else's door.",
  ],
  [
    "The first visitor was not family. It was Mrs. Alvarez from downstairs, carrying soup in a container that had clearly lived many lives.",
    "She said, I am returning this because you once brought it back with beans.",
    "Mara did not remember the beans. Mrs. Alvarez did.",
    "They stood in the doorway, both pretending the soup was the main subject.",
    "Mrs. Alvarez looked at the cracked cup and said, that can be repaired.",
    "Mara said, I know.",
    "But she had not known until hearing someone else say it.",
    "That night, she searched for gold repair methods and discovered that some traditions do not hide cracks. They honor the line where breaking met care.",
    "She did not have gold. She had glue, yellow paint, and patience. It was enough for a beginning.",
    "Human message: repair does not erase the crack. It gives the crack a different job.",
  ],
  [
    "By the end of the month, the blue door opened every morning for ten minutes.",
    "Mara made this rule because forever was too heavy and ten minutes was a cup she could hold.",
    "Some mornings nobody passed. Some mornings Lio delivered news from the world: a lost umbrella, a dog with opinions, a cloud shaped like a shoe.",
    "Her sister visited and did not mention the unanswered calls until the second cup of tea.",
    "When she did, Mara used the sentence HumanChain had helped her build: I was not choosing silence against you. I was trapped inside it.",
    "Her sister closed her eyes. Then she said, I needed that sentence months ago.",
    "Mara said, I know.",
    "They did not fix everything. They fixed enough to have another conversation later.",
    "Enough is an underrated miracle.",
    "Human message: some relationships are repaired in installments. Do not despise the first payment.",
  ],
  [
    "HumanChain chose Mara's link for the monthly story because thousands of users kept returning to the same line: I opened the window before I opened the door.",
    "The story did not reveal her address, her face, or Lio's school. It kept the details that belonged to safety and shared the details that belonged to humanity.",
    "Readers added their own doors: hospital doors, bedroom doors, office doors, immigration doors, apology doors, doors inside the chest that had no hinges but still refused to move.",
    "A man wrote: I opened my email after six months.",
    "A woman wrote: I told my daughter I was scared.",
    "A student wrote: I washed one plate.",
    "A grandfather wrote: I said his name out loud.",
    "The Human Verdict formed slowly: people do not come back all at once. They return through small openings they can survive.",
    "Mara read that sentence while holding the repaired cup.",
    "Human message: do not measure return by distance. Measure it by direction.",
  ],
  [
    "On the last page, HumanChain asked readers to choose one object near them: a key, a cup, a ticket, a plant, a shoe, a phone, a photograph.",
    "Then it asked: what has this object watched you survive?",
    "The answers became the most saved chain of the month.",
    "A key watched someone stop going back to a house where love had become fear.",
    "A cup watched someone drink water after three days of forgetting they had a body.",
    "A train ticket watched someone leave and later forgive themselves for leaving.",
    "A plant watched someone learn that care can be scheduled before it becomes feeling.",
    "A phone watched someone not send the cruel message.",
    "A photograph watched someone remember without drowning.",
    "Human message: ordinary objects become sacred when they stay beside us while we change.",
  ],
  [
    "Mara still has difficult days. The story does not pretend otherwise.",
    "Some mornings the blue door is heavy again. Some calls still go unanswered. Some grief returns wearing a new coat.",
    "But the plant is alive. The cup holds tea. The key is no longer an accusation. The ticket is tucked into a book, not because she failed to leave, but because she learned there are many kinds of movement.",
    "Lio still draws impossible suns.",
    "Mrs. Alvarez still pretends soup is logistics.",
    "Mara still opens HumanChain when she needs a sentence strong enough to borrow.",
    "And once a week, she writes one for someone else.",
    "Final monthly question: what is one small opening you can survive today?",
    "Add your link if you can. Save this story if saving is all you have.",
    "Human message: you do not have to open the whole door. Begin where light can enter.",
  ],
];

const storyBeats = globalStoryChapters.flat();

const ambientStoryArt: StoryArtKind[] = [
  "closed-door",
  "key-ticket",
  "repaired-cup",
  "open-window",
  "plant-door",
  "open-door",
  "light-opening",
  "phone-thread",
  "anonymous",
  "windows",
  "add-link",
];

type StoryTextItem = {
  text: string;
  art?: StoryArtKind;
};

function createBalancedStoryPages(
  items: StoryTextItem[],
  minLength = 320,
  maxLength = 560,
) {
  const pages: Array<{ text: string; art?: StoryArtKind; sourceIndex: number }> = [];
  let text = "";
  let art: StoryArtKind | undefined;
  let sourceIndex = 0;

  items.forEach((item, index) => {
    const nextText = text ? `${text} ${item.text}` : item.text;

    if (text && text.length >= minLength && nextText.length > maxLength) {
      pages.push({ text, art, sourceIndex });
      text = item.text;
      art = item.art;
      sourceIndex = index;
      return;
    }

    text = nextText;
    art = art ?? item.art;
  });

  if (text) {
    pages.push({ text, art, sourceIndex });
  }

  return pages;
}

// ─── story image helpers ──────────────────────────────────────────────────────

function storyImageAltForPage(text: string, theme: "monthly" | PublishedStoryKey) {
  const lowerText = text.toLowerCase();

  if (theme === "bitcoin") {
    if (lowerText.includes("private key") || lowerText.includes("hold a key")) {
      return "Colored story image of a hand holding a private key and digital value";
    }

    if (lowerText.includes("blockchain") || lowerText.includes("network") || lowerText.includes("borders")) {
      return "Colored story image of a global network on a desk at sunrise";
    }

    return "Colored story image of a dawn desk where a global money idea begins";
  }

  if (theme === "orb") {
    return "Colored story image of a calm Orb verification room and a real human being seen";
  }

  if (theme === "onePage") {
    if (lowerText.includes("notebook") || lowerText.includes("page") || lowerText.includes("wrote")) {
      return "Colored story image of an open notebook where one honest life page is written";
    }

    return "Colored story image of a rainy bus stop with coins, a notebook, and human kindness";
  }

  if (lowerText.includes("window") || lowerText.includes("plant") || lowerText.includes("opening")) {
    return "Colored story image of a slightly open apartment window and a small plant";
  }

  if (
    lowerText.includes("cup") ||
    lowerText.includes("key") ||
    lowerText.includes("ticket") ||
    lowerText.includes("table") ||
    lowerText.includes("repair")
  ) {
    return "Colored story image of a cracked cup, key, and train ticket on a warm apartment table";
  }

  return "Colored story image of the blue door where the monthly story begins";
}

function storyPhotoForKind(kind: StoryArtKind) {
  if (
    kind === "earth-chain" ||
    kind === "world-thread" ||
    kind === "net" ||
    kind === "public-square" ||
    kind === "verdict-mirror"
  ) {
    return "/images/story-scene-bitcoin-network-color.png";
  }

  if (
    kind === "honest-message" ||
    kind === "phone-thread" ||
    kind === "low-battery" ||
    kind === "repair-call" ||
    kind === "voice-wall" ||
    kind === "anonymous" ||
    kind === "future-screen"
  ) {
    return "/images/story-scene-orb-verify-color.png";
  }

  if (
    kind === "key-ticket" ||
    kind === "repaired-cup" ||
    kind === "memory-table" ||
    kind === "notes" ||
    kind === "bed-photo" ||
    kind === "ocean-memory" ||
    kind === "repair"
  ) {
    return "/images/story-scene-door-table-color.png";
  }

  if (
    kind === "open-window" ||
    kind === "plant-door" ||
    kind === "open-door" ||
    kind === "light-opening" ||
    kind === "cracked-tree" ||
    kind === "sunrise-windows" ||
    kind === "four-windows" ||
    kind === "add-link"
  ) {
    return "/images/story-scene-door-window-color.png";
  }

  return "/images/story-cover-door-color.png";
}

function storyPhotoForTheme(kind: StoryArtKind, theme: "monthly" | PublishedStoryKey) {
  if (theme === "bitcoin") {
    if (kind === "key-ticket" || kind === "hands" || kind === "low-battery") {
      return "/images/story-scene-bitcoin-key-color.png";
    }

    if (
      kind === "earth-chain" ||
      kind === "phone-table" ||
      kind === "world-thread" ||
      kind === "net" ||
      kind === "public-square" ||
      kind === "future-screen" ||
      kind === "verdict-mirror" ||
      kind === "add-link"
    ) {
      return "/images/story-scene-bitcoin-network-color.png";
    }

    return "/images/story-cover-bitcoin-color.png";
  }

  if (theme === "orb") {
    return "/images/story-scene-orb-verify-color.png";
  }

  if (theme === "onePage") {
    return "/images/story-scene-onepage-write-color.png";
  }

  return storyPhotoForKind(kind);
}

function storyPhotoForStoryPage(
  text: string,
  kind: StoryArtKind,
  theme: "monthly" | PublishedStoryKey,
) {
  const lowerText = text.toLowerCase();

  if (theme === "bitcoin") {
    if (
      lowerText.includes("private key") ||
      lowerText.includes("hold a key") ||
      lowerText.includes("lose the key") ||
      lowerText.includes("belongs to me")
    ) {
      return "/images/story-scene-bitcoin-key-color.png";
    }

    if (
      lowerText.includes("blockchain") ||
      lowerText.includes("network") ||
      lowerText.includes("computers") ||
      lowerText.includes("borders") ||
      lowerText.includes("verify value") ||
      lowerText.includes("global")
    ) {
      return "/images/story-scene-bitcoin-network-color.png";
    }

    return "/images/story-cover-bitcoin-color.png";
  }

  if (theme === "orb") {
    return "/images/story-scene-orb-verify-color.png";
  }

  if (theme === "onePage") {
    if (
      lowerText.includes("notebook") ||
      lowerText.includes("one page") ||
      lowerText.includes("wrote") ||
      lowerText.includes("write")
    ) {
      return "/images/story-scene-onepage-write-color.png";
    }

    return "/images/story-cover-onepage-color.png";
  }

  if (
    lowerText.includes("window") ||
    lowerText.includes("plant") ||
    lowerText.includes("air") ||
    lowerText.includes("opening") ||
    lowerText.includes("sunrise")
  ) {
    return "/images/story-scene-door-window-color.png";
  }

  if (
    lowerText.includes("cup") ||
    lowerText.includes("key") ||
    lowerText.includes("ticket") ||
    lowerText.includes("table") ||
    lowerText.includes("repair") ||
    lowerText.includes("soup")
  ) {
    return "/images/story-scene-door-table-color.png";
  }

  return storyPhotoForTheme(kind, theme);
}

// ─── published story collection ───────────────────────────────────────────────

const monthlyStoryTextPages = createBalancedStoryPages(
  storyBeats.map((text) => ({ text })),
);

const storyPages = monthlyStoryTextPages.map((storyPage, index) => {
  const storyImage = storyImageByPage[storyPage.sourceIndex + 1];
  const image = monthlyStoryImagePages.has(index)
    ? storyImage ?? {
        alt: "Black and white story image reflecting this part of the monthly story",
        art: ambientStoryArt[index % ambientStoryArt.length],
      }
    : null;
  const nextText = monthlyStoryTextPages[index + 1]?.text;

  const imageWithPhoto = image
    ? {
        ...image,
        alt: storyImageAltForPage(storyPage.text, "monthly"),
        photo: image.photo ?? storyPhotoForStoryPage(storyPage.text, image.art, "monthly"),
      }
    : null;

  return {
    page: index + 1,
    text: storyPage.text,
    image: imageWithPhoto,
    nextHint: nextText
      ? `Next: ${createStoryHint(nextText)}`
      : "Next: add your own link to the chain.",
  };
});

const bitcoinWorldStory = {
  title: "One Seed, One World",
  subtitle: "Bitcoin, World, and the Human Chain",
  author: "written in Africa by only1",
  publisher: "jontAWorld",
  price: "2 WLD",
  coverArt: "earth-chain" as const,
  coverPhoto: "/images/story-cover-bitcoin-color.png",
  photos: bitcoinStoryPhotos,
  pages: [
    {
      art: "earth-chain" as const,
      text: "In a small room somewhere on earth, a person using the name Satoshi wrote an idea that did not sound rich at first. It sounded like a seed: money that could move between people without asking a bank to stand in the middle.",
    },
    {
      art: "phone-table" as const,
      text: "Bitcoin began as software, a white paper, and a question: what if trust could be shared by a network instead of guarded by one office? The first believers were not buying a lifestyle. They were testing a machine for agreement.",
    },
    {
      art: "world-thread" as const,
      text: "The machine was the blockchain. Every block carried records. Every record was checked by many computers. The chain did not ask people to love each other. It asked them to verify the same truth.",
    },
    {
      art: "key-ticket" as const,
      text: "To own bitcoin was to hold a key. Not a golden key for showing off, but a private key that meant: this belongs to me because the network can prove it. Lose the key, and the lesson became painfully human.",
    },
    {
      art: "low-battery" as const,
      text: "At first, Bitcoin was quiet. Then it became a rumor, then a risk, then a price on screens, then a story families argued about at tables. Some saw freedom. Some saw danger. Some only saw numbers moving too fast.",
    },
    {
      art: "public-square" as const,
      text: "What Bitcoin became was bigger than a coin. It became a public square for one question: who should control value when the world no longer trusts every gatekeeper?",
    },
    {
      art: "verdict-mirror" as const,
      text: "But Bitcoin also revealed something hard. A network can prove coins moved, but it cannot prove the person behind a screen is real, honest, or in need. Money can travel globally while humanity still remains hidden.",
    },
    {
      art: "cover-symbol" as const,
      text: "That is where World enters the reflection. World asks another question: if the internet is filling with bots and artificial voices, how do real humans prove they are human without giving away their whole life?",
    },
    {
      art: "honest-message" as const,
      text: "Bitcoin gave the world a way to verify value. World gives the world a way to verify humanness. One is a chain of money. One is a chain of people. HumanChain stands where those two lessons meet.",
    },
    {
      art: "hands" as const,
      text: "In Africa, this story is not abstract. People know what it means to wait for payments, to mistrust systems, to be talented but unseen, to need a global door that does not ask where your passport was printed.",
    },
    {
      art: "net" as const,
      text: "Bitcoin taught us that value can cross borders. World suggests that identity can also cross borders. HumanChain asks for the next step: can verified humans cross borders with answers, stories, warnings, prayers, and help?",
    },
    {
      art: "reply-ribbon" as const,
      text: "A coin by itself does not comfort a lonely person. A verified answer can. A payment can reward a storyteller. A tip can thank a stranger. A question can travel farther when WLD gives it weight.",
    },
    {
      art: "future-screen" as const,
      text: "The future will not be only about owning digital money. It will be about knowing which voices are human, which communities are real, and which networks deserve trust when everything online can be copied.",
    },
    {
      art: "train" as const,
      text: "Bitcoin was the train that showed value could move without old rails. World is building a station for real people. HumanChain can become the place where those people speak before they transact.",
    },
    {
      art: "light-opening" as const,
      text: "The lesson is simple enough to remember: Bitcoin made scarcity digital. World makes humanness visible. HumanChain makes that visibility useful by turning humans into a living chain of meaning.",
    },
    {
      art: "add-link" as const,
      text: "So the story does not end with Satoshi, price charts, or headlines. It ends with a verified human opening the app and adding one link: what should value mean if the whole world can finally answer?",
    },
  ],
};

const publishedStoryCollection = {
  bitcoin: {
    ...bitcoinWorldStory,
    shelfTitle: "Bitcoin By Satoshi",
  },
  orb: {
    title: "The ORB",
    subtitle: "A World Story About Being Seen",
    author: "short real story by only1",
    publisher: "jontAWorld",
    price: "2 WLD",
    shelfTitle: "The ORB",
    coverArt: "anonymous" as const,
    coverPhoto: "/images/story-cover-orb-color.png",
    photos: orbStoryPhotos,
    pages: [
      {
        art: "anonymous" as const,
        text: "The first time Nia heard about the Orb, she imagined a machine that wanted to take something from her. In her city, people had learned to be careful with promises, especially when the promise arrived wearing technology.",
      },
      {
        art: "voice-wall" as const,
        text: "Her brother said it was not about taking her name. It was about proving she was one real human in a world where screens had become crowded with copies, scripts, and voices that did not breathe.",
      },
      {
        art: "windows" as const,
        text: "Nia did not believe him at first. She had seen too many systems ask poor people for trust and give them waiting rooms in return. But the question stayed with her: if the internet could no longer tell who was human, who would be heard?",
      },
      {
        art: "four-windows" as const,
        text: "At the verification center, nobody asked for her secrets. The process felt smaller than the rumor. A light, a pause, a confirmation. The app did not tell her she was special. It told her she was unique.",
      },
      {
        art: "open-window" as const,
        text: "That word followed her home. Unique did not mean rich. It did not mean safe. It meant there was one Nia, one set of tired hands, one laugh, one history no bot could borrow.",
      },
      {
        art: "plant-door" as const,
        text: "Weeks later, Nia joined HumanChain and answered a stranger's question about fear. Her answer crossed borders. Someone saved it. Someone tipped it. Someone replied: I thought I was alone.",
      },
      {
        art: "repaired-cup" as const,
        text: "That was when the Orb changed meaning. It was no longer only a device in a room. It became a doorway into a public square where being human could carry weight again.",
      },
      {
        art: "closed-door" as const,
        text: "Human message: technology becomes human when it helps a real person become visible without making them smaller.",
      },
    ],
  },
  onePage: {
    title: "One Page From My Life",
    subtitle: "A Human Submission",
    author: "human submission styled by only1",
    publisher: "jontAWorld",
    price: "3 WLD",
    shelfTitle: "One Page From My Life",
    coverArt: "memory-table" as const,
    coverPhoto: "/images/story-cover-onepage-color.png",
    photos: onePageStoryPhotos,
    pages: [
      {
        art: "memory-table" as const,
        text: "I once owned a notebook with only one page left. I kept it for something important, so important that I never used it. Every day I carried it in my bag like a small future waiting for permission.",
      },
      {
        art: "stair-symbol" as const,
        text: "When I left home for work, my mother put coins in my palm and told me not to spend them on pride. I laughed because I did not understand. Pride was not sold in shops, so I thought I was safe.",
      },
      {
        art: "bed-photo" as const,
        text: "The city taught me otherwise. Pride was refusing to call when I was hungry. Pride was saying fine when my battery was one percent and my heart was less. Pride was pretending directions were easy.",
      },
      {
        art: "ocean-memory" as const,
        text: "One night, a stranger shared food with me at a bus stop. He did not ask my story. He only said, tomorrow you will help someone else and then this food will keep moving.",
      },
      {
        art: "notes" as const,
        text: "I went home and finally used the last page. I wrote: I survived because somebody did not wait to know whether I deserved kindness.",
      },
      {
        art: "broken-streak" as const,
        text: "Years later, I still think a life can change on one page. Not the whole book. Just one honest page where a human stops hiding and lets another human enter.",
      },
    ],
  },
};

type PublishedStoryKey = keyof typeof publishedStoryCollection;

type PublishedStoryPage = {
  page: number;
  text: string;
  image: StoryImage | null;
  nextHint: string;
};

function createStoryHint(text: string) {
  const cleaned = text.replace(/^Human message:\s*/i, "");
  const firstSentence = cleaned.split(".")[0];

  return firstSentence.length > 78
    ? `${firstSentence.slice(0, 78).trim()}...`
    : firstSentence;
}

const publishedStoryPages = Object.fromEntries(
  Object.entries(publishedStoryCollection).map(([key, story]) => {
    const storyTextPages = createBalancedStoryPages(story.pages, 300, 620);

    return [
      key,
      storyTextPages.map((page, index) => {
        const nextText = storyTextPages[index + 1]?.text;
        const theme = key as PublishedStoryKey;

        return {
          page: index + 1,
          text: page.text,
          image: publishedStoryImagePages.has(index)
            ? {
              alt: storyImageAltForPage(page.text, theme),
              art: page.art ?? story.coverArt,
              photo: storyPhotoForStoryPage(page.text, page.art ?? story.coverArt, theme),
            }
            : null,
          nextHint: nextText
            ? `Next: ${createStoryHint(nextText)}`
            : "Next: add your own link to this story.",
        };
      }),
    ];
  }),
) as Record<PublishedStoryKey, PublishedStoryPage[]>;

const storyShelf = [
  {
    key: "monthly",
    title: "The Door That Waited",
    label: "Monthly Human Story",
    publisher: "jontAWorld",
    detail: "A life story about returning through small openings.",
    price: "Free",
  },
  {
    key: "bitcoin",
    title: "Bitcoin By Satoshi",
    label: "Published Short Story",
    publisher: "jontAWorld",
    detail: "One Seed, One World: Bitcoin, World, and the Human Chain.",
    price: "Read",
  },
  {
    key: "orb",
    title: "The ORB",
    label: "World Story",
    publisher: "jontAWorld",
    detail: "A cinematic story about proof, identity, and being seen.",
    price: "Read",
  },
  {
    key: "onePage",
    title: "One Page From My Life",
    label: "Human Submissions",
    publisher: "jontAWorld",
    detail: "Paid stories from verified humans, reviewed before publishing.",
    price: "Read",
  },
];

const storyCategories = [
  "World Stories",
  "Money Stories",
  "Faith Stories",
  "Life Stories",
  "Builder Stories",
];

const creatorEconomy = [
  ["Story tips", "Readers reward stories that move them."],
  ["Featured answers", "Top answers can earn visibility and future rewards."],
  ["Premium reflections", "Deep Story and Deep Verdict unlocks support creators."],
  ["Chain boosts", "Humans can boost important fields and links with WLD."],
  ["Marketplace publishing", "Sellers and businesses pay small fees to list, boost, and promote."],
];

const trustTools = [
  "Verified-only publishing",
  "Marketplace listing history",
  "Story review queue",
  "Report harmful content",
  "Anti-spam question limits",
  "Blocked-topic safety review",
];

// ─── utility functions ────────────────────────────────────────────────────────

function scrollMiniAppToTop() {
  if (typeof window === "undefined") {
    return;
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({
      left: 0,
      top: 0,
      behavior: "auto",
    });
    document.querySelectorAll<HTMLElement>(".phone-frame, .screen").forEach((element) => {
      element.scrollTo({
        left: 0,
        top: 0,
        behavior: "auto",
      });
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

// ─── helper components ────────────────────────────────────────────────────────

function StoryCoverPhoto({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) {
  return (
    <figure
      className="cover-art realistic-cover"
    >
      <img
        alt={alt}
        src={src}
      />
    </figure>
  );
}

function StoryThumbImage({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) {
  return <img alt={alt} className="story-thumb-image" src={src} />;
}

function StoryPaperArt({
  alt,
  kind,
}: {
  alt: string;
  kind: StoryArtKind;
}) {
  return (
    <figure aria-label={alt} className={`paper-art paper-art-${kind}`} role="img">
      <div className="paper-art-grain" />
      <svg
        aria-hidden="true"
        className="paper-art-svg"
        viewBox="0 0 360 230"
      >
        <defs>
          <filter id="rough-pencil">
            <feTurbulence
              baseFrequency="0.75"
              numOctaves="2"
              result="noise"
              seed="7"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.55" />
          </filter>
        </defs>
        <rect className="sketch-wash" height="230" rx="18" width="360" />
        <StoryArtScene kind={kind} />
      </svg>
    </figure>
  );
}

function StoryWallImage({
  alt,
  kind,
  src,
}: {
  alt: string;
  kind: StoryArtKind;
  src?: string;
}) {
  const imageSrc = src ?? storyPhotoForKind(kind);

  return (
    <figure aria-label={alt} className={`story-wall-photo wall-photo-${kind}`}>
      <div className="wall-photo-frame">
        <img alt={alt} src={imageSrc} />
      </div>
    </figure>
  );
}

function RealisticStoryScene({ kind }: { kind: StoryArtKind }) {
  const blueDoorScene = (
    <>
      <rect className="real-bg wall" height="230" width="360" />
      <path className="real-floor" d="M0 176h360v54H0z" />
      <path className="real-shadow" d="M70 199c72 19 157 19 233-2" />
      <rect className="real-door-frame" height="152" rx="3" width="96" x="143" y="32" />
      <rect className="real-door" height="134" rx="2" width="70" x="156" y="44" />
      <rect className="real-door-panel" height="48" rx="2" width="38" x="172" y="60" />
      <path className="real-door-light" d="M226 44c34 33 45 82 30 136" />
      <circle className="real-knob" cx="215" cy="117" r="5" />
      <ellipse className="real-head" cx="185" cy="105" rx="17" ry="19" />
      <path className="real-body" d="M153 170c7-43 18-66 34-66 18 0 31 24 38 66Z" />
      <rect className="real-phone" height="33" rx="5" width="22" x="210" y="128" />
      <path className="real-cup" d="M72 142h47v29c0 17-10 28-24 28s-23-11-23-28v-29Z" />
      <path className="real-cup-handle" d="M119 151c18-2 23 23 3 28" />
      <path className="real-crack" d="M97 144l-9 14 12 9-8 19 10 13" />
      <path className="real-thread" d="M48 155c49-58 91 18 128-42 43-70 77 2 135-48" />
      <circle className="real-node" cx="48" cy="155" r="7" />
      <circle className="real-node" cx="176" cy="113" r="7" />
      <circle className="real-node" cx="311" cy="65" r="7" />
    </>
  );

  const tableScene = (
    <>
      <rect className="real-bg warm" height="230" width="360" />
      <path className="real-window-light" d="M226 18h92v148h-92z" />
      <path className="real-table" d="M42 148h276l-22 58H64Z" />
      <path className="real-shadow" d="M76 188c64 21 150 20 213 0" />
      <path className="real-cup large" d="M78 112h58v42c0 23-13 37-29 37s-29-14-29-37v-42Z" />
      <path className="real-cup-handle large" d="M136 124c22-1 30 31 4 36" />
      <path className="real-crack large" d="M108 116l-12 18 14 12-10 24 13 20" />
      <rect className="real-note" height="58" rx="5" width="82" x="170" y="102" />
      <path className="real-note-line" d="M184 120h48M184 136h38M184 151h44" />
      <path className="real-thread" d="M60 125c61-34 95 28 148-4 36-22 67-16 94 16" />
      <circle className="real-node" cx="60" cy="125" r="6" />
      <circle className="real-node" cx="208" cy="121" r="6" />
    </>
  );

  const phoneScene = (
    <>
      <rect className="real-bg night" height="230" width="360" />
      <path className="real-window-light blue" d="M31 28h92v126H31z" />
      <ellipse className="real-head" cx="184" cy="83" rx="20" ry="22" />
      <path className="real-body coat" d="M139 176c10-59 24-87 45-87s38 29 48 87Z" />
      <rect className="real-phone glow" height="44" rx="6" width="28" x="198" y="121" />
      <path className="real-phone-light" d="M212 121c33 18 51 39 62 72" />
      <path className="real-thread" d="M58 158c40-35 76-16 112-48 49-43 70 23 136-28" />
      <circle className="real-node" cx="58" cy="158" r="6" />
      <circle className="real-node" cx="170" cy="110" r="6" />
      <circle className="real-node" cx="306" cy="82" r="6" />
      <path className="real-shadow" d="M88 194c54 19 146 20 205 1" />
    </>
  );

  const worldScene = (
    <>
      <rect className="real-bg world" height="230" width="360" />
      <circle className="real-globe" cx="180" cy="111" r="74" />
      <path className="real-globe-line" d="M112 91c44-15 91-15 136 0M109 132c48 22 97 22 142 0M180 38c-24 48-24 98 0 147M180 38c24 48 24 98 0 147" />
      <path className="real-thread" d="M71 133c46-36 78 18 119-31 35-42 63 12 99-18" />
      <circle className="real-node" cx="71" cy="133" r="6" />
      <circle className="real-node" cx="190" cy="102" r="6" />
      <circle className="real-node" cx="289" cy="84" r="6" />
      <path className="real-shadow" d="M90 201c54 16 126 16 181 0" />
    </>
  );

  const lightScene = (
    <>
      <rect className="real-bg dawn" height="230" width="360" />
      <path className="real-floor" d="M0 172h360v58H0z" />
      <rect className="real-door-frame" height="146" rx="4" width="94" x="104" y="42" />
      <path className="real-open-door" d="M198 43l72 28v94l-72 23Z" />
      <path className="real-door-light wide" d="M199 74c41 19 58 50 52 93" />
      <path className="real-plant" d="M265 187c-4-39 8-67 35-90M300 97c-24 17-44 19-61 7M300 97c25 10 39 30 41 57" />
      <path className="real-thread" d="M62 160c52-28 84 20 132-11 38-24 73-19 104 13" />
      <circle className="real-node" cx="62" cy="160" r="6" />
      <circle className="real-node" cx="194" cy="149" r="6" />
    </>
  );

  if (
    kind === "earth-chain" ||
    kind === "world-thread" ||
    kind === "net" ||
    kind === "public-square" ||
    kind === "verdict-mirror"
  ) {
    return worldScene;
  }

  if (
    kind === "honest-message" ||
    kind === "phone-thread" ||
    kind === "low-battery" ||
    kind === "repair-call" ||
    kind === "voice-wall" ||
    kind === "anonymous" ||
    kind === "future-screen"
  ) {
    return phoneScene;
  }

  if (
    kind === "key-ticket" ||
    kind === "repaired-cup" ||
    kind === "memory-table" ||
    kind === "notes" ||
    kind === "bed-photo" ||
    kind === "ocean-memory" ||
    kind === "repair"
  ) {
    return tableScene;
  }

  if (
    kind === "open-window" ||
    kind === "plant-door" ||
    kind === "open-door" ||
    kind === "light-opening" ||
    kind === "cracked-tree" ||
    kind === "sunrise-windows" ||
    kind === "four-windows" ||
    kind === "add-link"
  ) {
    return lightScene;
  }

  return blueDoorScene;
}

function StoryArtScene({ kind }: { kind: StoryArtKind }) {
  const nodes = {
    "cover-symbol": (
      <>
        <path className="sketch-line heavy" d="M54 188h252" />
        <path className="sketch-line heavy" d="M119 45h122v143H119z" />
        <path className="sketch-line" d="M139 66h82v100h-82z" />
        <path className="gold-line" d="M122 188c24-71 52-111 116-143" />
        <circle className="gold-dot" cx="238" cy="45" r="6" />
        <circle className="sketch-fill" cx="180" cy="91" r="19" />
        <path className="sketch-fill" d="M142 174c6-39 18-62 38-62s32 23 38 62Z" />
        <rect className="sketch-line" height="34" rx="5" width="24" x="196" y="119" />
        <path className="gold-line" d="M202 132h12M202 142h9" />
        <path className="gold-line" d="M220 132c28-19 45-44 52-76" />
        <circle className="gold-dot" cx="272" cy="56" r="5" />
        <circle className="sketch-line" cx="77" cy="129" r="17" />
        <path className="gold-line" d="M94 129h34M113 129v12" />
        <path className="sketch-line" d="M259 108h44v36h-44zM268 123h25" />
        <path className="sketch-line" d="M65 76h42v30H65zM76 91h20" />
        <path className="gold-line" d="M93 105c31 28 66 33 105 27" />
        <path className="sketch-line" d="M140 188c21-13 58-13 80 0" />
      </>
    ),
    "closed-door": (
      <>
        <path className="sketch-line heavy" d="M123 48h114v144H123z" />
        <path className="sketch-line" d="M145 70h70v94h-70z" />
        <circle className="gold-dot" cx="204" cy="120" r="5" />
        <path className="gold-line" d="M88 194h184" />
        <path className="sketch-line" d="M97 194c23-18 48-26 75-24M263 194c-23-18-48-26-75-24" />
      </>
    ),
    "key-ticket": (
      <>
        <rect className="sketch-line heavy" height="70" rx="8" width="118" x="168" y="84" />
        <path className="sketch-line" d="M190 105h70M190 124h48M179 84v70" />
        <circle className="sketch-line heavy" cx="94" cy="120" r="20" />
        <path className="gold-line" d="M114 120h72M154 120v19M171 120v13" />
        <path className="sketch-line" d="M222 154c-13 21-45 20-58 0" />
      </>
    ),
    "repaired-cup": (
      <>
        <path className="sketch-line heavy" d="M116 88h116v61c0 30-22 50-58 50s-58-20-58-50V88Z" />
        <path className="sketch-line" d="M232 109c33-3 45 34 14 50M119 88h110" />
        <path className="gold-line" d="M174 90l-17 25 20 17-16 27 17 35" />
        <path className="sketch-line" d="M94 199h164" />
      </>
    ),
    "open-window": (
      <>
        <path className="sketch-line heavy" d="M93 62h174v121H93z" />
        <path className="sketch-line" d="M180 62v121M93 123h174" />
        <path className="gold-line" d="M184 122c26-26 48-35 79-31" />
        <path className="sketch-line" d="M109 158c22-17 42-17 62 0M199 159c20-18 41-18 62 0" />
        <circle className="gold-dot" cx="263" cy="91" r="6" />
      </>
    ),
    "plant-door": (
      <>
        <path className="sketch-line heavy" d="M84 55h104v137H84z" />
        <path className="gold-line" d="M188 139c28-20 51-20 79 0" />
        <path className="sketch-line" d="M236 176c-3-32 6-55 27-73M263 103c-20 12-37 14-51 5M263 103c18 6 28 20 32 41" />
        <circle className="gold-dot" cx="188" cy="139" r="5" />
        <path className="sketch-line" d="M105 192h180" />
      </>
    ),
    "open-door": (
      <>
        <path className="sketch-line heavy" d="M103 54h91v141H103zM194 54l65 28v94l-65 19" />
        <path className="gold-line" d="M194 84c34 18 48 45 42 82" />
        <circle className="gold-dot" cx="223" cy="129" r="5" />
        <path className="sketch-line" d="M87 195h192" />
      </>
    ),
    "light-opening": (
      <>
        <path className="sketch-line heavy" d="M86 66h188v120H86z" />
        <path className="sketch-line" d="M131 66v120M229 66v120" />
        <path className="gold-line" d="M132 186c25-62 48-90 97-120" />
        <path className="gold-line" d="M132 186h97" />
        <circle className="gold-dot" cx="229" cy="66" r="6" />
      </>
    ),
    hands: (
      <>
        <path className="sketch-line heavy" d="M74 128c38-30 77-31 110-8 19 13 34 14 53 7 21-8 39-3 52 10" />
        <path className="sketch-line" d="M64 151c42 21 85 23 128 9 31-10 68-7 100 9" />
        <ellipse className="gold-fill" cx="165" cy="127" rx="13" ry="7" />
        <ellipse className="gold-fill" cx="194" cy="134" rx="11" ry="6" />
        <ellipse className="sketch-fill" cx="142" cy="139" rx="10" ry="6" />
        <path className="sketch-line" d="M96 98c22 3 45 9 62 22M268 103c-22 3-45 10-62 24" />
      </>
    ),
    "world-thread": (
      <>
        <ellipse className="sketch-line heavy" cx="180" cy="116" rx="104" ry="61" />
        <path className="sketch-line" d="M85 103c56-23 120-24 190 0M88 130c50 25 121 25 185 0M180 56c-23 42-24 83 0 122M180 56c24 43 24 84 0 122" />
        <path className="gold-line" d="M78 147c46-42 85-17 113-50 37-43 71-4 93-30" />
        <circle className="gold-dot" cx="78" cy="147" r="5" />
        <circle className="gold-dot" cx="191" cy="97" r="5" />
        <circle className="gold-dot" cx="284" cy="67" r="5" />
        <path className="sketch-line" d="M122 83l21 8 18-4 14 13M218 139l22-12 26 9" />
      </>
    ),
    "phone-table": (
      <>
        <path className="sketch-line heavy" d="M64 163h232M78 163l28-76h150l28 76" />
        <rect className="sketch-line" height="70" rx="8" width="43" x="157" y="81" />
        <path className="gold-line" d="M166 105h25M166 119h18" />
        <path className="sketch-line" d="M100 126h42M106 112c10-8 21-8 31 0M236 121c20 0 30 9 26 22-5 15-29 14-35 2" />
      </>
    ),
    "stair-symbol": (
      <>
        <path className="sketch-line heavy" d="M78 174h204M101 145h157M124 116h110M147 87h63" />
        <path className="gold-line" d="M90 174c34-61 73-92 120-87" />
        <circle className="gold-dot" cx="210" cy="87" r="7" />
        <path className="sketch-line" d="M232 88c24 7 41 22 51 46" />
        <path className="sketch-line" d="M115 69c19 12 42 13 67 2" />
      </>
    ),
    "honest-message": (
      <>
        <rect className="sketch-line heavy" height="95" rx="14" width="68" x="82" y="68" />
        <path className="gold-line" d="M96 101h40M96 116h29M96 131h35" />
        <path className="sketch-line heavy" d="M185 79h96v68h-96z" />
        <path className="sketch-line" d="M201 104h62M201 121h39" />
        <path className="gold-line" d="M150 112c24-25 42-27 60-8" />
        <circle className="gold-dot" cx="150" cy="112" r="5" />
      </>
    ),
    "phone-thread": (
      <>
        <rect className="sketch-line heavy" height="88" rx="12" width="54" x="70" y="83" />
        <path className="gold-line" d="M122 116c58-50 111 35 166-21" />
        <circle className="gold-dot" cx="122" cy="116" r="5" />
        <circle className="gold-dot" cx="197" cy="124" r="5" />
        <circle className="gold-dot" cx="288" cy="95" r="5" />
        <path className="sketch-line" d="M181 70c44 9 78 39 88 79M151 153c34 22 82 26 124 5" />
      </>
    ),
    "memory-table": (
      <>
        <path className="sketch-line heavy" d="M71 170h220M111 170l23-88h92l26 88" />
        <circle className="sketch-line" cx="181" cy="76" r="24" />
        <path className="sketch-line" d="M142 121h42v30h-42zM204 113h42v34h-42zM153 136l10-8 10 8M216 130l8-7 11 11" />
        <path className="gold-line" d="M169 104c15-12 33-12 50 0" />
      </>
    ),
    "reply-ribbon": (
      <>
        <rect className="sketch-line heavy" height="56" rx="14" width="108" x="68" y="72" />
        <rect className="sketch-line heavy" height="56" rx="14" width="108" x="185" y="116" />
        <path className="sketch-line" d="M92 95h61M92 110h41M209 139h61M209 154h39" />
        <path className="gold-line" d="M176 108c27 3 42 12 52 28" />
        <circle className="gold-dot" cx="176" cy="108" r="5" />
        <circle className="gold-dot" cx="228" cy="136" r="5" />
      </>
    ),
    train: (
      <>
        <path className="sketch-line heavy" d="M48 160h264M78 66h204v94H78z" />
        <path className="sketch-line" d="M108 86h48v44h-48zM174 86h80v44h-80zM95 160l-31 38M264 160l31 38" />
        <circle className="sketch-line" cx="145" cy="145" r="16" />
        <rect className="sketch-line" height="29" rx="4" width="20" x="174" y="139" />
        <path className="gold-line" d="M178 151h12" />
      </>
    ),
    repair: (
      <>
        <path className="sketch-line heavy" d="M65 164h236M92 164l21-80h136l24 80" />
        <circle className="sketch-line" cx="155" cy="123" r="24" />
        <path className="sketch-line" d="M155 99v48M131 123h48M208 109h45M208 124h37M211 139h29" />
        <rect className="sketch-line" height="37" rx="4" width="29" x="82" y="111" />
        <path className="gold-line" d="M124 87l-30 59M252 90l-50 57" />
      </>
    ),
    net: (
      <>
        <path className="sketch-line heavy" d="M55 166c70-34 171-34 250 0" />
        <path className="sketch-line" d="M84 79c37 61 93 92 182 83M279 82c-44 57-105 85-190 82" />
        {Array.from({ length: 7 }).map((_, index) => (
          <path
            className="sketch-line"
            d={`M${91 + index * 26} 83c12 38 12 65 0 86`}
            key={index}
          />
        ))}
        <circle className="gold-dot" cx="176" cy="135" r="5" />
      </>
    ),
    "cracked-tree": (
      <>
        <path className="sketch-line heavy" d="M62 171h236M76 171l45-92h153l23 92" />
        <path className="sketch-line" d="M164 171l19-38-17-15 23-39M187 133l22 14-12 24" />
        <path className="gold-line" d="M190 86c2-28 16-45 43-52" />
        <path className="sketch-line" d="M232 34c-26 16-46 19-61 9M232 34c22 7 35 23 40 47" />
        <circle className="gold-dot" cx="190" cy="86" r="5" />
      </>
    ),
    anonymous: (
      <>
        <path className="sketch-line" d="M65 170c62-28 162-28 230 0M81 151h198" />
        <rect className="sketch-line heavy" height="67" rx="14" width="146" x="107" y="62" />
        <path className="gold-line" d="M136 94h88M149 109h61" />
        <path className="sketch-line" d="M92 142l-11-31M269 142l11-31M124 143l7-24M236 143l-7-24" />
      </>
    ),
    "repair-call": (
      <>
        <path className="sketch-line heavy" d="M58 169h244M78 169l26-81h93l21 81" />
        <path className="sketch-line" d="M113 116h58M113 132h40M128 91l-22 64M187 94l-47 62" />
        <rect className="sketch-line heavy" height="46" rx="8" width="32" x="238" y="91" />
        <path className="gold-line" d="M218 116c-21-13-37-12-49 3M270 112c26-8 42 0 50 24" />
        <circle className="gold-dot" cx="218" cy="116" r="5" />
      </>
    ),
    notes: (
      <>
        <path className="sketch-line heavy" d="M57 165h250M86 165l34-86h128l31 86" />
        <rect className="sketch-line" height="48" rx="5" width="52" x="109" y="99" />
        <rect className="sketch-line" height="44" rx="5" width="39" x="179" y="93" />
        <path className="sketch-line" d="M119 113h29M119 126h21M187 106h20M187 119h16" />
        <path className="gold-line" d="M223 125c18-15 34-12 44 4" />
      </>
    ),
    "bed-photo": (
      <>
        <path className="sketch-line heavy" d="M54 158h252M73 126h99v32H73zM172 103h111v55H172z" />
        <rect className="sketch-line" height="42" rx="4" width="57" x="201" y="74" />
        <path className="sketch-line" d="M211 99l12-11 10 9 8-7 9 10" />
        <path className="gold-line" d="M137 134c25-22 56-26 89-10" />
      </>
    ),
    "ocean-memory": (
      <>
        <path className="sketch-line heavy" d="M58 160h244M79 119h113v41H79zM192 97h83v63h-83z" />
        <rect className="sketch-line" height="46" rx="5" width="68" x="206" y="65" />
        <path className="sketch-line" d="M214 92c17-11 32-11 48 0M214 101c18-8 35-8 52 0" />
        <path className="gold-line" d="M206 126c-32 0-54-8-68-24" />
        <circle className="gold-dot" cx="206" cy="126" r="5" />
      </>
    ),
    "voice-wall": (
      <>
        <path className="sketch-line heavy" d="M62 61h236v122H62z" />
        {Array.from({ length: 8 }).map((_, index) => (
          <circle
            className="sketch-line"
            cx={96 + (index % 4) * 55}
            cy={91 + Math.floor(index / 4) * 49}
            key={index}
            r="15"
          />
        ))}
        <path className="gold-line" d="M82 166c20-25 38 21 56-6s35 19 53-8 38 14 62-4" />
      </>
    ),
    "broken-streak": (
      <>
        <path className="sketch-line heavy" d="M74 88h212v82H74z" />
        <path className="sketch-line" d="M105 126h38M162 126h38M219 126h38" />
        <path className="gold-line" d="M104 126c14-22 27-22 40 0M219 126c14-22 27-22 40 0" />
        <path className="sketch-line heavy" d="M171 99l19 54M203 99l-19 54" />
        <circle className="gold-dot" cx="124" cy="126" r="5" />
        <circle className="gold-dot" cx="239" cy="126" r="5" />
      </>
    ),
    windows: (
      <>
        <path className="sketch-line heavy" d="M58 75h100v103H58zM202 75h100v103H202z" />
        <path className="sketch-line" d="M108 75v103M58 126h100M252 75v103M202 126h100" />
        <path className="gold-line" d="M159 125c16-18 28-18 42 0" />
        <circle className="gold-dot" cx="108" cy="126" r="4" />
        <circle className="gold-dot" cx="252" cy="126" r="4" />
      </>
    ),
    "sunrise-windows": (
      <>
        <path className="sketch-line heavy" d="M52 166h256M70 77h70v89H70zM146 64h68v102h-68zM220 77h70v89h-70z" />
        <path className="gold-line" d="M100 119c35-41 117-41 160 0" />
        <circle className="gold-dot" cx="180" cy="108" r="9" />
        <path className="sketch-line" d="M90 148c5-16 23-16 29 0M167 148c7-19 26-19 33 0M241 148c5-16 23-16 29 0" />
      </>
    ),
    "four-windows": (
      <>
        <path className="sketch-line heavy" d="M64 69h76v76H64zM220 69h76v76h-76zM110 117h64v76h-64zM186 117h64v76h-64z" />
        <path className="sketch-line" d="M102 69v76M64 107h76M258 69v76M220 107h76M142 117v76M110 155h64M218 117v76M186 155h64" />
        <path className="gold-line" d="M102 145c39-31 111-31 156 0" />
        <circle className="gold-dot" cx="102" cy="145" r="5" />
        <circle className="gold-dot" cx="258" cy="145" r="5" />
      </>
    ),
    "future-screen": (
      <>
        <rect className="sketch-line heavy" height="77" rx="14" width="147" x="107" y="63" />
        <path className="gold-line" d="M132 94h99M148 111h67" />
        <circle className="sketch-line" cx="77" cy="158" r="17" />
        <circle className="sketch-line" cx="284" cy="158" r="17" />
        <path className="sketch-line" d="M94 158h63M205 158h62M180 140v45" />
      </>
    ),
    "public-square": (
      <>
        <path className="sketch-line heavy" d="M49 168h262M92 168l23-91h130l24 91" />
        <rect className="sketch-line" height="52" rx="8" width="39" x="143" y="91" />
        <rect className="sketch-line" height="52" rx="8" width="39" x="199" y="91" />
        <path className="gold-line" d="M151 114h22M207 114h22" />
        <circle className="sketch-line" cx="101" cy="151" r="13" />
        <circle className="sketch-line" cx="279" cy="151" r="13" />
      </>
    ),
    "low-battery": (
      <>
        <path className="sketch-line heavy" d="M55 158h250M76 121h110v37H76zM186 98h90v60h-90z" />
        <rect className="sketch-line" height="48" rx="7" width="30" x="152" y="72" />
        <path className="gold-line" d="M158 109h18" />
        <path className="sketch-line" d="M214 124h31M214 138h22" />
      </>
    ),
    "verdict-mirror": (
      <>
        <path className="sketch-line heavy" d="M118 58h124v124H118z" />
        <path className="sketch-line" d="M142 84h76M142 105h56M142 126h74M142 147h46" />
        <path className="gold-line" d="M97 94c-21 17-28 36-21 57M263 94c21 17 28 36 21 57" />
        <circle className="sketch-line" cx="77" cy="154" r="16" />
        <circle className="sketch-line" cx="283" cy="154" r="16" />
        <circle className="gold-dot" cx="180" cy="182" r="6" />
      </>
    ),
    "earth-chain": (
      <>
        <circle className="sketch-line heavy" cx="180" cy="116" r="78" />
        <path className="sketch-line" d="M111 93c42-15 83-15 138 2M108 138c42 19 92 21 146 0M180 38c-23 51-23 104 0 156M180 38c24 51 24 104 0 156" />
        <path className="gold-line" d="M90 128c44-33 68 16 102-27 31-38 54 12 82-12" />
        <circle className="gold-dot" cx="90" cy="128" r="5" />
        <circle className="gold-dot" cx="192" cy="101" r="5" />
        <circle className="gold-dot" cx="274" cy="89" r="5" />
      </>
    ),
    "add-link": (
      <>
        <rect className="sketch-line heavy" height="86" rx="12" width="58" x="77" y="80" />
        <path className="sketch-line" d="M96 105h21M96 119h15" />
        <path className="gold-line" d="M135 126c46-32 74 12 112-21" />
        <circle className="gold-dot" cx="135" cy="126" r="5" />
        <circle className="gold-dot" cx="247" cy="105" r="5" />
        <path className="sketch-line heavy" d="M250 87v38M231 106h38" />
        <path className="sketch-line" d="M174 158c33 20 72 21 113 4" />
      </>
    ),
  } satisfies Record<StoryArtKind, React.ReactNode>;

  return nodes[kind];
}

// ─── main component ───────────────────────────────────────────────────────────

export function StoriesView({
  act,
  earnPoints,
  feedRefreshNonce,
  humanIdentity,
  keepStreak,
  openPayment,
  recordHistory,
  setSavedItems,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  feedRefreshNonce: number;
  humanIdentity: HumanIdentity | null;
  keepStreak: (detail?: string) => void;
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
  setSavedItems: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [isReading, setIsReading] = useState(false);
  const [activePublishedStory, setActivePublishedStory] =
    useState<PublishedStoryKey | null>(null);
  const [activeUserStory, setActiveUserStory] = useState<UserStory | null>(null);
  const [page, setPage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [userStories, setUserStories] = useState<UserStory[]>(() =>
    loadJsonFromStorage<UserStory[]>(storageKeys.userStories, []),
  );
  const [fileDraft, setFileDraft] = useState<{
    dataUrl?: string;
    fileName?: string;
    fileText?: string;
    fileType?: string;
    title: string;
  }>({ title: "" });
  const [microDraft, setMicroDraft] = useState({
    coverImage: "",
    text: "",
    title: "",
  });
  const publishedStory = activePublishedStory
    ? publishedStoryCollection[activePublishedStory]
    : null;
  const activePages = activePublishedStory
    ? publishedStoryPages[activePublishedStory]
    : storyPages;
  const current = activePages[page];
  const activeTitle = publishedStory?.title ?? "The Door That Waited";
  const activePublisher = publishedStory?.publisher ?? "HumanChain Monthly";
  const activeAuthor = publishedStory?.author ?? "monthly human story";
  const microCharacters = microDraft.text.length;

  useEffect(() => {
    scrollMiniAppToTop();
  }, [activePublishedStory, activeUserStory, isReading, page]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.userStories, userStories);
  }, [userStories]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setUserStories((current) => {
        const storedStories = loadJsonFromStorage<UserStory[]>(storageKeys.userStories, []);
        const seen = new Set(current.map((story) => `${story.id}:${story.author}:${story.title}`));
        const incoming = storedStories.filter(
          (story) => !seen.has(`${story.id}:${story.author}:${story.title}`),
        );

        return incoming.length ? [...incoming, ...current].slice(0, 60) : current;
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [feedRefreshNonce]);

  function saveStory() {
    setSavedItems((value) => value + 1);
    earnPoints(8, "Saved stories improve your Human Points record.");
    keepStreak("The monthly Human Story was saved to your library.");
  }

  function saveStoryReceipt(story: UserStory) {
    void storeSafeData("story", story.id, story).then((receipt) => {
      if (!receipt.ok) {
        return;
      }

      setUserStories((current) =>
        current.map((item) =>
          item.id === story.id
            ? {
                ...item,
                dataReceiptUrl: receipt.url,
                storageStatus: "cloud-safe",
              }
            : item,
        ),
      );
    });
  }

  function publishUserStory(story: UserStory) {
    setUserStories((current) => [story, ...current]);
    saveStoryReceipt(story);
    recordHistory({
      title: story.kind === "file" ? "Story file published" : "200-character story published",
      detail: `${story.title} was stored by ${story.author}.`,
      kind: "story",
    });
    earnPoints(story.kind === "file" ? 24 : 14, "Your story was stored in HumanChain.");
    keepStreak("Your story joined HumanChain.");
    act("Story published", `${story.title} is stored and ready for readers.`);
  }

  function publishFileStory() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "submitting a file story")) {
      return;
    }

    if (!fileDraft.dataUrl && !fileDraft.fileText) {
      act("Story file required", "Upload a PDF or text file before paying to publish.");
      return;
    }

    const title = fileDraft.title.trim() || fileDraft.fileName || "HumanChain story file";

    openPayment({
      title: "Publish story file",
      amount: "4 WLD",
      detail: "Publish one PDF or text story file with a readable preview and stored HumanChain receipt.",
      success: "Story file payment confirmed. Your story is now published.",
      feature: "story-file-publish",
      points: 18,
      onConfirmed: () => {
        const story: UserStory = {
          author: humanIdentity?.username ?? "@you",
          authorWallet: humanIdentity?.wallet,
          createdAt: formatShortTime(),
          fileDataUrl: fileDraft.dataUrl,
          fileName: fileDraft.fileName,
          fileText: fileDraft.fileText,
          fileType: fileDraft.fileType,
          id: Date.now(),
          kind: "file",
          owner: true,
          storageStatus: "local-safe",
          text: "Published file story. Open the preview to read it.",
          title,
        };

        publishUserStory(story);
        setFileDraft({ title: "" });
      },
    });
  }

  function publishMicroStory() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "publishing a short story")) {
      return;
    }

    const title = microDraft.title.trim() || "200-character HumanChain story";

    if (microCharacters !== 200) {
      act("Exact length required", `Write exactly 200 characters. Current count: ${microCharacters}.`);
      return;
    }

    if (!microDraft.coverImage) {
      act("Cover image required", "Add a cover image before publishing this free story.");
      return;
    }

    const story: UserStory = {
      author: humanIdentity?.username ?? "@you",
      authorWallet: humanIdentity?.wallet,
      coverImage: microDraft.coverImage,
      createdAt: formatShortTime(),
      id: Date.now(),
      kind: "micro",
      owner: true,
      storageStatus: "local-safe",
      text: microDraft.text,
      title,
    };

    publishUserStory(story);
    setMicroDraft({ coverImage: "", text: "", title: "" });
  }

  function deleteUserStory(storyId: number) {
    const story = userStories.find((item) => item.id === storyId);

    if (!story?.owner) {
      act("Only your story", "Only the human who published this story can delete it.");
      return;
    }

    setUserStories((current) => current.filter((item) => item.id !== storyId));
    recordHistory({
      title: "Story deleted",
      detail: story.title,
      kind: "delete",
    });
    act("Story deleted", "Your published story was removed from this device.");
  }

  if (activeUserStory) {
    return (
      <div className="screen story-reader-screen">
        <section className="reader-top">
          <button onClick={() => setActiveUserStory(null)} type="button">
            Stories
          </button>
          <span>{activeUserStory.kind === "file" ? "File story" : "200-character story"}</span>
          <button
            onClick={() =>
              openPayment({
                title: "Tip storyteller",
                amount: "1 WLD",
                allowCustomAmount: true,
                context: {
                  creatorWallet: activeUserStory.authorWallet,
                  payerWallet: humanIdentity?.wallet,
                  tippedAuthor: activeUserStory.author,
                },
                detail: `Support ${activeUserStory.author}.`,
                success: "Story tip is prepared for World App.",
                feature: "tip-storyteller",
                points: 4,
              })
            }
            type="button"
          >
            Tip
          </button>
        </section>
        <article className="story-page user-story-page">
          <header className="reader-masthead">
            <span>{activeUserStory.author} - {activeUserStory.createdAt}</span>
            <h1>{activeUserStory.title}</h1>
            <small>{activeUserStory.storageStatus === "cloud-safe" ? "Cloud-safe story receipt" : "Local-safe story receipt"}</small>
          </header>
          {activeUserStory.coverImage ? (
            <img alt={`${activeUserStory.title} cover`} className="user-story-cover" src={activeUserStory.coverImage} />
          ) : null}
          {activeUserStory.kind === "file" ? (
            <div className="story-file-preview">
              <strong>{activeUserStory.fileName ?? "Uploaded story file"}</strong>
              {activeUserStory.fileType === "application/pdf" && activeUserStory.fileDataUrl ? (
                <object
                  aria-label={`${activeUserStory.title} PDF preview`}
                  data={activeUserStory.fileDataUrl}
                  type="application/pdf"
                >
                  <a href={activeUserStory.fileDataUrl}>Open PDF story</a>
                </object>
              ) : activeUserStory.fileText ? (
                <pre>{activeUserStory.fileText}</pre>
              ) : activeUserStory.fileDataUrl ? (
                <a href={activeUserStory.fileDataUrl}>Open uploaded story file</a>
              ) : (
                <p>Story file preview is unavailable on this device.</p>
              )}
            </div>
          ) : (
            <p>{activeUserStory.text}</p>
          )}
        </article>
      </div>
    );
  }

  if (isReading || activePublishedStory) {
    return (
      <div className="screen story-reader-screen">
        <section className="reader-top">
          <button
            onClick={() => {
              setIsReading(false);
              setActivePublishedStory(null);
              setPage(0);
            }}
            type="button"
          >
            Cover
          </button>
          <span>
            Page {current.page} / {activePages.length}
          </span>
          <button
            onClick={() =>
              openPayment({
                title: "Tip storyteller",
                amount: "1 WLD",
                allowCustomAmount: true,
                context: {
                  payerWallet: humanIdentity?.wallet,
                  tippedAuthor: activeAuthor,
                },
                detail: "Support the human behind this story.",
                success: "Story tip is prepared for World App.",
                feature: "tip-storyteller",
                points: 4,
              })
            }
            type="button"
          >
            Tip
          </button>
          <div
            className="reader-progress"
            style={{ "--progress": `${((page + 1) / activePages.length) * 100}%` } as React.CSSProperties}
          />
        </section>
        <article className="story-page">
          {page === 0 ? (
            <header className="reader-masthead">
              <span>{publishedStory ? "Published story" : "Monthly human story"}</span>
              <h1>{activeTitle}</h1>
              <small>
                Published by {activePublisher}
                {publishedStory ? ` - ${activeAuthor}` : ""}
              </small>
            </header>
          ) : null}
          {current.image ? (
            <StoryWallImage
              alt={current.image.alt}
              kind={current.image.art}
              src={current.image.photo}
            />
          ) : null}
          {page > 0 ? <span className="reader-chapter">{activeTitle}</span> : null}
          <p>{current.text}</p>
        </article>
        <section className="reader-actions">
          <button
            disabled={page === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            type="button"
          >
            Previous
          </button>
          <button onClick={saveStory} type="button">
            Save
          </button>
          <button
            disabled={page === activePages.length - 1}
            onClick={() =>
              setPage((value) => Math.min(activePages.length - 1, value + 1))
            }
            type="button"
          >
            Next
          </button>
        </section>
        <section className="reader-bookmark-row">
          <button
            className="story-bookmark-btn"
            onClick={() => openPayment({
              title: "Bookmark this story",
              amount: "0.5",
              detail: "Save this story permanently to your HumanChain reading list. Access it from your profile any time.",
              success: "Story bookmarked to your permanent reading list.",
              feature: "story-bookmark",
              points: 5,
            })}
            type="button"
          >
            ✦ Bookmark · 0.5 WLD
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="Human Story" subtitle="Monthly stories and published reflections from verified humans." />
      <section className="story-cover">
        <StoryCoverPhoto
          alt="Colored cinematic cover for The Door That Waited showing a blue door and cracked cup"
          src={monthlyStoryCover}
        />
        <span>Featured Monthly Story</span>
        <h2>The Door That Waited</h2>
        <p>
          A monthly life story about a blue door, a cracked cup, and the small
          openings that help a human return.
        </p>
        <button
          onClick={() => {
            setIsReading(true);
            earnPoints(8, "Reading the monthly story strengthened your chain.");
            keepStreak("You opened this month's Human Story.");
          }}
          type="button"
        >
          Read Story
        </button>
      </section>
      <section className="story-cover bitcoin-cover">
        <StoryCoverPhoto
          alt="Colored cinematic cover for One Seed One World showing Bitcoin, a desk, and global connection"
          src={bitcoinWorldStory.coverPhoto}
        />
        <span>{bitcoinWorldStory.author}</span>
        <h2>{bitcoinWorldStory.title}</h2>
        <p>{bitcoinWorldStory.subtitle}. A clear story about what Bitcoin was, what it became, and how World reflects the next human layer.</p>
        <button
          onClick={() => {
            setPage(0);
            setActivePublishedStory("bitcoin");
            earnPoints(8, "Reading published stories grows your Human Points.");
            keepStreak("You opened Bitcoin, World, and the Human Chain.");
          }}
          type="button"
        >
          Read Published Story
        </button>
      </section>
      <section className="panel story-market">
        <div className="section-heading">
          <span>Published Story Library</span>
          <Library size={18} />
        </div>
        <div className="category-strip">
          {storyCategories.map((category) => (
            <button
              key={category}
              onClick={() => act(category, "This story category is now selected.")}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
        {storyShelf.map((story) => {
          const storyKey =
            story.key !== "monthly" ? (story.key as PublishedStoryKey) : null;
          const thumbnailSrc = storyKey
            ? publishedStoryCollection[storyKey].coverPhoto
            : monthlyStoryCover;

          return (
            <article className="shelf-row" key={story.title}>
              <StoryThumbImage
                alt={`${story.title} colored story cover`}
                src={thumbnailSrc}
              />
              <div>
                <span>{story.label}</span>
                <h3>{story.title}</h3>
                <small>publisher: {story.publisher}</small>
                <p>{story.detail}</p>
              </div>
              <button
                onClick={() => {
                  if (storyKey) {
                    setPage(0);
                    setActivePublishedStory(storyKey);
                    earnPoints(8, "You opened a published HumanChain story.");
                    keepStreak(`You opened ${story.title}.`);
                    return;
                  }

                  act(
                    story.title,
                    story.price === "Free"
                      ? "Open this story."
                      : `${story.price} will unlock this short story.`,
                  );
                }}
                type="button"
              >
                {story.price}
              </button>
            </article>
          );
        })}
      </section>
      {userStories.length ? (
        <section className="panel story-market">
          <div className="section-heading">
            <span>Your published stories</span>
            <BookOpen size={18} />
          </div>
          {userStories.map((story) => (
            <article className="shelf-row user-story-row" key={story.id}>
              {story.coverImage ? (
                <img alt={`${story.title} cover`} className="story-thumb-image" src={story.coverImage} />
              ) : (
                <div className="story-file-thumb">
                  <Library size={19} />
                </div>
              )}
              <div>
                <span>{story.kind === "file" ? "Paid file story" : "Free 200-character story"}</span>
                <h3>{story.title}</h3>
                <small>{story.author} - {story.createdAt} - {story.storageStatus === "cloud-safe" ? "safe receipt" : "local safe"}</small>
                <p>{story.kind === "file" ? story.fileName ?? "Uploaded story file" : story.text}</p>
              </div>
              <div className="story-row-actions">
                <button onClick={() => setActiveUserStory(story)} type="button">
                  Read
                </button>
                {story.owner ? (
                  <button className="danger" onClick={() => deleteUserStory(story.id)} type="button">
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}
      <section className="publish-card">
        <div>
          <span className="section-kicker">Publish to humans</span>
          <h2>Publish to Humans</h2>
          <p>
            Publish a free short reflection or a paid file story. Stories may be reviewed before appearing publicly.
          </p>
          <div className="story-quality-list">
            {[
              "Clear title",
              "Human-written",
              "No private information",
              "No harmful or fake claims",
              "Cover image added",
              "Category selected",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="story-publish-grid">
          <div className="story-publish-panel">
            <strong>File Story - 4 WLD</strong>
            <input
              aria-label="Story file title"
              onChange={(event) =>
                setFileDraft((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Story title"
              value={fileDraft.title}
            />
            <label className="upload-drop">
              <Upload size={20} />
              {fileDraft.fileName ?? "Upload PDF or text"}
              <input
                accept=".pdf,.txt,text/plain,application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  const validation = validateStoryFile({
                    size: file.size,
                    type: file.type || (file.name.toLowerCase().endsWith(".txt") ? "text/plain" : "application/pdf"),
                  });

                  if (!validation.ok) {
                    act("Story upload blocked", validation.issues[0] ?? humanChainErrorStates.upload_type_not_allowed);
                    return;
                  }

                  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setFileDraft((current) => ({
                        ...current,
                        dataUrl: undefined,
                        fileName: file.name,
                        fileText: String(reader.result).slice(0, 12000),
                        fileType: "text/plain",
                      }));
                      act("Story file selected", "Text story preview is ready.");
                    };
                    reader.readAsText(file);
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = () => {
                    setFileDraft((current) => ({
                      ...current,
                      dataUrl: String(reader.result),
                      fileName: file.name,
                      fileText: undefined,
                      fileType: file.type || "application/pdf",
                    }));
                    act("Story file selected", "PDF story preview is ready.");
                  };
                  reader.readAsDataURL(file);
                }}
                type="file"
              />
            </label>
            {fileDraft.fileType === "application/pdf" && fileDraft.dataUrl ? (
              <object aria-label="PDF story preview" className="draft-pdf-preview" data={fileDraft.dataUrl} type="application/pdf">
                PDF preview ready.
              </object>
            ) : fileDraft.fileText ? (
              <pre className="draft-text-preview">{fileDraft.fileText}</pre>
            ) : null}
            <button className="primary-command" onClick={publishFileStory} type="button">
              Publish file - 4 WLD
            </button>
          </div>
          <div className="story-publish-panel">
            <strong>Free Short Story</strong>
            <input
              aria-label="Short story title"
              onChange={(event) =>
                setMicroDraft((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Story title"
              value={microDraft.title}
            />
            <label className="upload-drop cover-drop">
              {microDraft.coverImage ? (
                <img alt="Short story cover preview" src={microDraft.coverImage} />
              ) : (
                <>
                  <Upload size={20} />
                  Add cover image
                </>
              )}
              <input
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = () => {
                    setMicroDraft((current) => ({
                      ...current,
                      coverImage: String(reader.result),
                    }));
                    act("Cover image uploaded", "Short story cover is ready.");
                  };
                  reader.readAsDataURL(file);
                }}
                type="file"
              />
            </label>
            <textarea
              aria-label="Exact 200 character story"
              maxLength={200}
              onChange={(event) =>
                setMicroDraft((current) => ({ ...current, text: event.target.value }))
              }
              placeholder="Write exactly 200 characters..."
              value={microDraft.text}
            />
            <small className={microCharacters === 200 ? "exact-count ready" : "exact-count"}>
              {microCharacters}/200 characters
            </small>
            <button className="primary-command" onClick={publishMicroStory} type="button">
              Publish free story
            </button>
          </div>
        </div>
      </section>
      <section className="panel creator-card">
        <div className="section-heading">
          <span>WLD creator economy</span>
          <Wallet size={18} />
        </div>
        {creatorEconomy.map(([title, detail]) => (
          <button
            className="creator-row"
            key={title}
            onClick={() => act(title, detail)}
            type="button"
          >
            <strong>{title}</strong>
            <span>{detail}</span>
          </button>
        ))}
      </section>
      <section className="panel trust-card">
        <div className="section-heading">
          <span>Moderation and trust</span>
          <ShieldCheck size={18} />
        </div>
        <div className="trust-grid">
          {trustTools.map((tool) => (
            <button
              key={tool}
              onClick={() => {
                earnPoints(10, "Trusted reports protect HumanChain quality.");
                act(tool, "Trust action queued for review.");
              }}
              type="button"
            >
              {tool}
            </button>
          ))}
        </div>
      </section>
      <section className="story-rating-card">
        <span className="section-kicker">Reader response</span>
        <h3>Rate this monthly story</h3>
        <div className="rating-actions" aria-label="Story rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              aria-pressed={rating >= value}
              className={rating >= value ? "active" : ""}
              key={value}
              onClick={() => {
                setRating(value);
                recordHistory({
                  title: "Story rating stored",
                  detail: `${value}/5 added to the monthly story.`,
                  kind: "story",
                });
                act("Story rated", `${value}/5 added to this monthly story.`);
              }}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
        <button
          className={liked ? "like-button active" : "like-button"}
          onClick={() => {
            setLiked((value) => !value);
            recordHistory({
              title: liked ? "Story like removed" : "Story like stored",
              detail: liked ? "Monthly story like removed." : "Monthly story like saved.",
              kind: "story",
            });
            act(
              liked ? "Like removed" : "Story liked",
              liked
                ? "Your reaction was removed."
                : "Your like was added to the monthly story.",
            );
          }}
          type="button"
        >
          {liked ? "Liked" : "Like Story"}
        </button>
      </section>
      <section className="panel">
        <div className="section-heading">
          <span>Story WLD actions</span>
          <Library size={18} />
        </div>
        <div className="compact-actions">
          <button
            onClick={() =>
              openPayment({
                title: "Tip storyteller",
                amount: "1 WLD",
                allowCustomAmount: true,
                context: {
                  payerWallet: humanIdentity?.wallet,
                  tippedAuthor: "storyteller",
                },
                detail: "Support the writer behind this story.",
                success: "Storyteller tip is prepared for World App.",
                feature: "tip-storyteller",
                points: 4,
              })
            }
            type="button"
          >
            Tip Storyteller
          </button>
          <button
            onClick={() =>
              openPayment({
                title: "Bonus story pages",
                amount: "2 WLD",
                detail: "Unlock author notes and reader reflections.",
                success: "Bonus pages are prepared for unlock.",
                points: 6,
              })
            }
            type="button"
          >
            Unlock Bonus Pages
          </button>
          <button
            onClick={() =>
              openPayment({
                title: "Deep Story Reflection",
                amount: "6 WLD",
                detail: "Create a private reflection from the story and your answers.",
                success: "Deep Story Reflection is prepared for World App.",
                points: 12,
              })
            }
            type="button"
          >
            Create Deep Reflection
          </button>
        </div>
      </section>
    </div>
  );
}
