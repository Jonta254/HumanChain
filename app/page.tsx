"use client";

import {
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  Flame,
  Gavel,
  HandCoins,
  HeartHandshake,
  Home,
  Library,
  LockKeyhole,
  MapPin,
  MessageCircleQuestion,
  Mic,
  PlusCircle,
  PenLine,
  Radio,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Settings,
  Store,
  Tag,
  Upload,
  UserRound,
  Users,
  Vote,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  authenticateHumanWallet,
  chatWithWorld,
  getWorldMiniAppContext,
  getWorldPermissions,
  humanHaptic,
  payWithWorld,
  Permission,
  requestWorldPermission,
  shareWithWorld,
} from "@/lib/worldMiniApp";
import { normalizePaymentFeature } from "@/lib/worldPayments";

const initialLinks = [
  {
    country: "Kenya",
    text: "Start before life feels perfect.",
  },
  {
    country: "Brazil",
    text: "Joy is also a form of survival.",
  },
  {
    country: "India",
    text: "Discipline is love for your future self.",
  },
  {
    country: "Japan",
    text: "Silence can be care when words are tired.",
  },
  {
    country: "Ghana",
    text: "A good name is built in the small moments nobody records.",
  },
  {
    country: "Philippines",
    text: "Begin with what your hands can do today.",
  },
  {
    country: "Portugal",
    text: "Peace is sometimes a bill paid early and a call returned honestly.",
  },
  {
    country: "South Africa",
    text: "The truth gets lighter when it is carried by more than one person.",
  },
  {
    country: "Mexico",
    text: "Family is not perfect people. It is people learning to return.",
  },
  {
    country: "Canada",
    text: "When the day is heavy, do the next kind thing.",
  },
];

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

type StoryImage = {
  alt: string;
  art: StoryArtKind;
  photo?: string;
};

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

function createStoryHint(text: string) {
  const cleaned = text.replace(/^Human message:\s*/i, "");
  const firstSentence = cleaned.split(".")[0];

  return firstSentence.length > 78
    ? `${firstSentence.slice(0, 78).trim()}...`
    : firstSentence;
}

const wldActions = [
  ["tip", "Tip, Golden Link, or streak restore"],
  ["pin", "Pin a link or unlock story pages"],
  ["country", "Ask one country or save a capsule"],
  ["private", "Ask privately as a verified human"],
  ["voice", "Request voice answers"],
  ["verdict", "Unlock Deep Human Verdict"],
];

const premiumServices = [
  {
    title: "Ask real humans",
    detail: "Paid questions with country, voice, and private answer modes.",
    price: "1-6 WLD",
  },
  {
    title: "Human Stories",
    detail: "Monthly story, public short stories, and paid human submissions.",
    price: "2 WLD+",
  },
  {
    title: "Chain Fields",
    detail: "Live rooms where verified humans build purpose around identity.",
    price: "Free + tips",
  },
  {
    title: "Deep Verdict",
    detail: "A premium synthesis from verified answers across the world.",
    price: "6 WLD",
  },
];

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

const publishSteps = [
  "Upload PDF, TXT, or write inside HumanChain",
  "Pay review and publishing fee",
  "HumanChain formats it into pages with a cover",
  "Readers can like, rate, save, and tip",
];

const answerQueue = [
  "What helped you keep going when nobody saw you struggling?",
  "What belief from your culture made you stronger?",
  "What should a young person know before chasing money?",
  "What is one truth about love people learn too late?",
];

const starterAskThreads = [
  {
    question: "How do I start again after losing confidence?",
    topic: "Life",
    mode: "Text",
    answers: [
      {
        user: "@mara_chain",
        country: "Kenya",
        text: "Start with one promise you can keep before sunset. Confidence returns through evidence.",
      },
      {
        user: "@renato_human",
        country: "Brazil",
        text: "Tell one safe person the truth. Shame gets weaker when it stops being private.",
      },
    ],
  },
  {
    question: "Should I chase money first or build skill first?",
    topic: "Money",
    mode: "Country",
    answers: [
      {
        user: "@builder_ama",
        country: "Ghana",
        text: "Build the skill that can earn in many rooms. Money follows usefulness more often than noise.",
      },
      {
        user: "@tomas_work",
        country: "Portugal",
        text: "Earn enough to breathe, then invest time in the skill that compounds.",
      },
    ],
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

const initialHumanPosts = [
  {
    id: 1,
    author: "@mara_chain",
    caption: "A quiet desk, one cup, and the sentence that helped me start again.",
    image: null as string | null,
    theme: "gold",
    reactions: 18,
    loves: 11,
    tips: 3,
    comments: ["This feels like my Monday.", "The cup detail stayed with me."],
    createdAt: "Today, 08:20",
    owner: false,
  },
  {
    id: 2,
    author: "@worldbuilder",
    caption: "Today I built one small thing before fear could explain why not.",
    image: null as string | null,
    theme: "green",
    reactions: 31,
    loves: 19,
    tips: 6,
    comments: ["Needed this.", "Small things count."],
    createdAt: "Today, 09:02",
    owner: false,
  },
  {
    id: 3,
    author: "@faith_worker",
    caption: "Morning light on my notebook before work. One prayer, one plan, one step.",
    image: null as string | null,
    theme: "gold",
    reactions: 24,
    loves: 14,
    tips: 4,
    comments: ["One prayer, one plan is strong."],
    createdAt: "Yesterday, 18:44",
    owner: false,
  },
];

const profileBadges = [
  "Verified human",
  "Chain keeper",
  "Story reader",
  "Answer helper",
  "Market seller",
];

const pointRules = [
  ["Daily check-in", "+10 HP"],
  ["Answer Daily Human", "+18 HP"],
  ["Answer a human", "+15 HP"],
  ["Ask a useful question", "+20 HP"],
  ["Add a chain link", "+12 HP"],
  ["Publish image post", "+16 HP"],
  ["Store marketplace listing", "+10 HP"],
  ["Enable nearby market", "+5 HP"],
  ["React to image post", "+5 HP"],
  ["Enter a field", "+6 HP"],
  ["Copy field quote", "+3 HP"],
  ["Read a story", "+8 HP"],
  ["Give a trusted report", "+10 HP"],
  ["Publish accepted story", "+120 HP"],
];

const dailyHumanQuestion = {
  title: "What truth did life teach you this week?",
  detail: "Every verified human can answer once. Best answers become tomorrow's World Verdict.",
  reward: "+18 HP",
};

const storyCategories = [
  "World Stories",
  "Money Stories",
  "Faith Stories",
  "Human Lessons",
  "African Stories",
  "Founder Stories",
];

const worldVerdictParts = [
  "What most humans said",
  "Best answer",
  "Country differences",
  "Hard truth",
  "Final verdict",
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

const appLanguages = [
  {
    code: "en",
    name: "English",
    nav: {
      ask: "Ask",
      chains: "Chains",
      home: "Home",
      market: "Market",
      me: "Me",
      stories: "Stories",
    },
    title: "HumanChain Guide",
    points: [
      "Be a real human: use World wallet login for trusted access.",
      "Ask useful questions and answer from lived experience.",
      "Marketplace buyers browse freely; sellers pay small fees to publish or boost.",
      "Use Human Chat for seller conversations and keep meetups safe.",
      "You can clear marketplace data, posts, history, or your local account anytime.",
    ],
    settingsTitle: "Settings",
  },
  {
    code: "es",
    name: "Spanish",
    nav: {
      ask: "Preguntar",
      chains: "Cadenas",
      home: "Inicio",
      market: "Mercado",
      me: "Yo",
      stories: "Historias",
    },
    title: "Guia de HumanChain",
    points: [
      "Entra como humano real con World wallet.",
      "Haz preguntas utiles y responde con experiencia real.",
      "Los compradores navegan gratis; los vendedores pagan poco para publicar o impulsar.",
      "Usa Human Chat para hablar con vendedores y mantener acuerdos seguros.",
      "Puedes borrar mercado, publicaciones, historial o tu cuenta local cuando quieras.",
    ],
    settingsTitle: "Ajustes",
  },
  {
    code: "fr",
    name: "French",
    nav: {
      ask: "Demander",
      chains: "Chaines",
      home: "Accueil",
      market: "Marche",
      me: "Moi",
      stories: "Histoires",
    },
    title: "Guide HumanChain",
    points: [
      "Entre comme humain verifie avec World wallet.",
      "Pose des questions utiles et reponds avec experience humaine.",
      "Les acheteurs parcourent librement; les vendeurs paient peu pour publier ou booster.",
      "Utilise Human Chat pour parler aux vendeurs et garder les echanges clairs.",
      "Tu peux effacer le marche, les posts, l'historique ou le compte local.",
    ],
    settingsTitle: "Reglages",
  },
  {
    code: "pt",
    name: "Portuguese",
    nav: {
      ask: "Perguntar",
      chains: "Cadeias",
      home: "Inicio",
      market: "Mercado",
      me: "Eu",
      stories: "Historias",
    },
    title: "Guia HumanChain",
    points: [
      "Entre como humano real com World wallet.",
      "Faca perguntas uteis e responda com experiencia real.",
      "Compradores navegam livremente; vendedores pagam pouco para publicar ou impulsionar.",
      "Use Human Chat para conversar com vendedores e manter acordos claros.",
      "Voce pode limpar mercado, posts, historico ou a conta local quando quiser.",
    ],
    settingsTitle: "Configuracoes",
  },
  {
    code: "sw",
    name: "Swahili",
    nav: {
      ask: "Uliza",
      chains: "Minyororo",
      home: "Nyumbani",
      market: "Soko",
      me: "Mimi",
      stories: "Hadithi",
    },
    title: "Mwongozo wa HumanChain",
    points: [
      "Ingia kama binadamu halisi kwa kutumia World wallet.",
      "Uliza maswali yenye maana na jibu kutokana na uzoefu wa maisha.",
      "Wanunuzi wanaweza kuvinjari bure; wauzaji hulipa ada ndogo kuchapisha au kuongeza mwonekano.",
      "Tumia Human Chat kuzungumza na wauzaji na kuweka makubaliano salama.",
      "Unaweza kufuta data ya soko, machapisho, historia, au akaunti ya ndani wakati wowote.",
    ],
    settingsTitle: "Mipangilio",
  },
];

type AppLanguage = (typeof appLanguages)[number];

const marketplaceItems = [
  {
    title: "Samsung Galaxy A54",
    seller: "@nairobitech",
    condition: "Second hand",
    price: "WLD 22",
    distance: "1.4 km",
    location: "Westlands",
    tag: "Phone",
    trust: "World ID seller",
    tone: "blue",
    photos: 3,
    quality: "Clean front, back, and screen photos",
    bidding: {
      target: 22,
      floor: 18,
      ends: "18h left",
      offers: [
        { buyer: "@sam_bid", amount: 18, note: "Can pick in Westlands today." },
        { buyer: "@techmama", amount: 20, note: "Cashless pickup after work." },
      ],
    },
  },
  {
    title: "New Ankara tote batch",
    seller: "@amina_makes",
    condition: "New listed",
    price: "WLD 4",
    distance: "2.1 km",
    location: "Kilimani",
    tag: "Handmade",
    trust: "3 verified buyers",
    tone: "gold",
    photos: 4,
    quality: "Styled product photos and size detail",
    bidding: {
      target: 4,
      floor: 3,
      ends: "2d left",
      offers: [
        { buyer: "@giftbuyer", amount: 3, note: "Need two bags if available." },
      ],
    },
  },
  {
    title: "Restaurant launch poster",
    seller: "@taste254",
    condition: "Sponsored",
    price: "Open link",
    distance: "3.8 km",
    location: "Lavington",
    tag: "Marketing",
    trust: "Business link allowed",
    tone: "green",
    photos: 2,
    quality: "Menu preview and shop-front image",
    bidding: null,
  },
  {
    title: "Used study desk",
    seller: "@student_chain",
    condition: "Second hand",
    price: "WLD 7",
    distance: "4.6 km",
    location: "Ngong Road",
    tag: "Home",
    trust: "Pickup only",
    tone: "violet",
    photos: 3,
    quality: "Wide photo plus scratches disclosed",
    bidding: {
      target: 7,
      floor: 5,
      ends: "9h left",
      offers: [
        { buyer: "@campusbuyer", amount: 5, note: "Can collect near Ngong Road." },
      ],
    },
  },
];

const marketplacePlans = [
  ["Quick listing", "1 WLD", "Publish one item with 3 included photos."],
  ["Extra photo pack", "2 WLD", "Add up to 3 more photos to one listing."],
  ["Local boost", "2 WLD", "Push a listing higher in nearby discovery."],
  ["Business ad", "4 WLD", "Market a shop, service, event, or link."],
];

const marketplaceSignals = [
  "Location-first discovery",
  "3 photos included per listing",
  "Timed bidding near seller price",
  "New and second-hand items",
  "World Chat seller inbox",
  "Business links and campaigns",
];

const marketplaceChecklist = [
  "Clear cover photo",
  "Price and condition",
  "Pickup area or delivery note",
  "Seller link or chat",
];

type MarketplaceListing = {
  dataReceiptUrl?: string;
  dataStorageStatus?: "cloud-safe" | "local-safe";
  id: number;
  title: string;
  price: string;
  bidFloor: string;
  duration: string;
  saleMode: "direct" | "bidding";
  condition: string;
  area: string;
  link: string;
  details: string;
  photos: Array<{ id: number; name: string; src: string }>;
  status: "draft" | "payment-ready";
  createdAt: string;
};

type MarketplaceItem = (typeof marketplaceItems)[number];

type MarketBid = {
  amount: number;
  buyer: string;
  createdAt: string;
  dataReceiptUrl?: string;
  dataStorageStatus?: "cloud-safe" | "local-safe";
  id: number;
  note: string;
  status: "saved" | "sent";
};

type MarketLocationState = {
  accuracy?: number;
  label: string;
  lat?: number;
  lng?: number;
  source: "not-requested" | "browser-gps" | "manual" | "unavailable";
  status: "idle" | "requesting" | "ready" | "denied";
};

type Tab = "home" | "ask" | "market" | "chains" | "stories" | "me";

type StoryArtKind =
  | "cover-symbol"
  | "closed-door"
  | "key-ticket"
  | "repaired-cup"
  | "open-window"
  | "plant-door"
  | "open-door"
  | "light-opening"
  | "hands"
  | "world-thread"
  | "phone-table"
  | "stair-symbol"
  | "honest-message"
  | "phone-thread"
  | "memory-table"
  | "reply-ribbon"
  | "train"
  | "repair"
  | "net"
  | "cracked-tree"
  | "anonymous"
  | "repair-call"
  | "notes"
  | "bed-photo"
  | "ocean-memory"
  | "voice-wall"
  | "broken-streak"
  | "windows"
  | "sunrise-windows"
  | "four-windows"
  | "future-screen"
  | "public-square"
  | "low-battery"
  | "verdict-mirror"
  | "earth-chain"
  | "add-link";

type Toast = {
  title: string;
  detail: string;
};

type EarnPoints = (amount: number, reason: string) => void;

type PaymentRequest = {
  title: string;
  amount: string;
  detail: string;
  success: string;
  feature?: string;
  points?: number;
};

type OpenPayment = (payment: PaymentRequest) => void;

type DailyResponse = {
  user: string;
  text: string;
  time: string;
};

type HumanPost = (typeof initialHumanPosts)[number] & {
  dataReceiptUrl?: string;
  storageStatus?: "cloud-safe" | "local-safe";
};

type HistoryRecord = {
  id: number;
  title: string;
  detail: string;
  time: string;
  kind: "post" | "reaction" | "comment" | "tip" | "delete" | "profile" | "market";
};

type VerifiedHuman = {
  username: string;
  wallet?: string;
  mode: "world" | "preview";
};

type AppMemory = {
  appLanguageCode: string;
  dailyAnswered: boolean;
  dailyAnsweredAt: string | null;
  marketLocation: MarketLocationState;
  notificationReady: boolean;
  points: number;
  savedItems: number;
  streak: number;
  verifiedHuman: VerifiedHuman | null;
};

function formatWorldLaunchLocation(location?: string | null) {
  const labels: Record<string, string> = {
    "app-store": "App Store",
    chat: "World Chat",
    "deep-link": "deep link",
    home: "World Home",
    "wallet-tab": "wallet tab",
  };

  return location ? labels[location] ?? location : "World App preview";
}

const storageKeys = {
  appMemory: "humanchain_app_memory",
  bids: "humanchain_market_bids",
  history: "humanchain_history",
  marketplace: "humanchain_marketplace",
  posts: "humanchain_posts",
} as const;

function loadJsonFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function saveJsonToStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

async function storeSafeData(
  kind: "post" | "marketplace-listing" | "marketplace-bid",
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

function getInitialMarketBids() {
  return Object.fromEntries(
    marketplaceItems.map((item) => [
      item.title,
      (item.bidding?.offers ?? []).map((offer) => ({
        ...offer,
        createdAt: "Seed",
        id: Math.round((offer.amount + item.title.length) * 1000),
        status: "sent" as const,
      })),
    ]),
  );
}

function loadStoredHumanPosts() {
  if (typeof window === "undefined") {
    return initialHumanPosts;
  }

  return loadJsonFromStorage<HumanPost[]>(storageKeys.posts, initialHumanPosts);
}

function loadStoredMarketplaceListings(): MarketplaceListing[] {
  if (typeof window === "undefined") {
    return [];
  }

  return loadJsonFromStorage<MarketplaceListing[]>(storageKeys.marketplace, []);
}

function loadStoredHistoryRecords(): HistoryRecord[] {
  if (typeof window === "undefined") {
    return [
      {
        id: 1,
        title: "HumanChain opened",
        detail: "Your chain history starts here.",
        time: "Today",
        kind: "profile",
      },
    ];
  }

  return loadJsonFromStorage<HistoryRecord[]>(storageKeys.history, [
    {
      id: 1,
      title: "HumanChain opened",
      detail: "Your chain history starts here.",
      time: "Today",
      kind: "profile",
    },
  ]);
}

function loadStoredAppMemory(): AppMemory {
  const fallback: AppMemory = {
    appLanguageCode: appLanguages[0].code,
    dailyAnswered: false,
    dailyAnsweredAt: null,
    marketLocation: {
      label: "Location not shared",
      source: "not-requested",
      status: "idle",
    },
    notificationReady: false,
    points: 420,
    savedItems: 3,
    streak: 4,
    verifiedHuman: null,
  };
  const stored = loadJsonFromStorage<Partial<AppMemory>>(storageKeys.appMemory, fallback);

  return {
    ...fallback,
    ...stored,
    marketLocation: stored.marketLocation ?? fallback.marketLocation,
    verifiedHuman: stored.verifiedHuman ?? fallback.verifiedHuman,
  };
}

export default function HumanChainApp() {
  const [storedAppMemory] = useState(loadStoredAppMemory);
  const [tab, setTab] = useState<Tab>("home");
  const [toast, setToast] = useState<Toast | null>(null);
  const [verifiedHuman, setVerifiedHuman] = useState<VerifiedHuman | null>(
    storedAppMemory.verifiedHuman,
  );
  const [gateBusy, setGateBusy] = useState(false);
  const [notificationReady, setNotificationReady] = useState(
    storedAppMemory.notificationReady,
  );
  const [worldContext, setWorldContext] = useState(getWorldMiniAppContext);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(
    appLanguages.find((language) => language.code === storedAppMemory.appLanguageCode) ??
      appLanguages[0],
  );
  const [streak, setStreak] = useState(storedAppMemory.streak);
  const [links, setLinks] = useState(initialLinks);
  const [savedItems, setSavedItems] = useState(storedAppMemory.savedItems);
  const [points, setPoints] = useState(storedAppMemory.points);
  const [dailyAnswered, setDailyAnswered] = useState(storedAppMemory.dailyAnswered);
  const [dailyAnsweredAt, setDailyAnsweredAt] = useState<string | null>(
    storedAppMemory.dailyAnsweredAt,
  );
  const [activeField, setActiveField] = useState<ChainField | null>(null);
  const [humanPosts, setHumanPosts] = useState<HumanPost[]>(loadStoredHumanPosts);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(
    loadStoredMarketplaceListings,
  );
  const [marketLocation, setMarketLocation] = useState<MarketLocationState>(
    storedAppMemory.marketLocation,
  );
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(
    loadStoredHistoryRecords,
  );
  const [dailyResponses, setDailyResponses] = useState<DailyResponse[]>([
    {
      user: "@mara_chain",
      text: "Life taught me that silence is sometimes rest, not failure.",
      time: "08:15",
    },
    {
      user: "@worldbuilder",
      text: "I learned that money is useful, but trusted people are rarer.",
      time: "09:02",
    },
  ]);
  const [paymentPrompt, setPaymentPrompt] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    getWorldPermissions()
      .then((result) => {
        setWorldContext(getWorldMiniAppContext());
        const permissions = result.data?.permissions as
          | { notifications?: boolean | { status?: string } }
          | undefined;
        const notifications = permissions?.notifications;
        const isGranted =
          notifications === true ||
          (typeof notifications === "object" && notifications?.status === "success");

        if (isGranted) {
          setNotificationReady(true);
        }
      })
      .catch(() => {
        setWorldContext(getWorldMiniAppContext());
      })
      .finally(() => {
        setWorldContext(getWorldMiniAppContext());
      });
  }, []);

  useEffect(() => {
    saveJsonToStorage(storageKeys.posts, humanPosts);
  }, [humanPosts]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.marketplace, marketplaceListings);
  }, [marketplaceListings]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.history, historyRecords);
  }, [historyRecords]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.appMemory, {
      appLanguageCode: appLanguage.code,
      dailyAnswered,
      dailyAnsweredAt,
      marketLocation,
      notificationReady,
      points,
      savedItems,
      streak,
      verifiedHuman,
    } satisfies AppMemory);
  }, [
    appLanguage,
    dailyAnswered,
    dailyAnsweredAt,
    marketLocation,
    notificationReady,
    points,
    savedItems,
    streak,
    verifiedHuman,
  ]);

  function act(title: string, detail: string) {
    setToast({ title, detail });
  }

  function recordHistory(record: Omit<HistoryRecord, "id" | "time">) {
    const time = new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    setHistoryRecords((current) => [
      {
        ...record,
        id: Date.now(),
        time,
      },
      ...current,
    ]);
  }

  function resetHistory() {
    setHistoryRecords([
      {
        id: Date.now(),
        title: "History reset",
        detail: "Local HumanChain activity history was cleared by the user.",
        time: "Now",
        kind: "profile",
      },
    ]);
    act("History reset", "Your local HumanChain activity record was cleared.");
  }

  function clearMarketplaceData() {
    setMarketplaceListings([]);
    recordHistory({
      title: "Marketplace data cleared",
      detail: "Stored listings, photos, links, and marketplace drafts were removed locally.",
      kind: "market",
    });
    act("Marketplace cleared", "Your local marketplace listings were removed from this device.");
  }

  function clearPostData() {
    setHumanPosts(initialHumanPosts);
    recordHistory({
      title: "Post data reset",
      detail: "Your local image posts were reset to the starter HumanChain feed.",
      kind: "delete",
    });
    act("Posts reset", "Your local image post data was cleared from this device.");
  }

  function deleteLocalAccount() {
    window.localStorage.removeItem(storageKeys.posts);
    window.localStorage.removeItem(storageKeys.marketplace);
    window.localStorage.removeItem(storageKeys.history);
    window.localStorage.removeItem(storageKeys.bids);
    window.localStorage.removeItem(storageKeys.appMemory);
    setHumanPosts(initialHumanPosts);
    setMarketplaceListings([]);
    setHistoryRecords([
      {
        id: Date.now(),
        title: "HumanChain opened",
        detail: "Your chain history starts here.",
        time: "Today",
        kind: "profile",
      },
    ]);
    setVerifiedHuman(null);
    setAppLanguage(appLanguages[0]);
    setDailyAnswered(false);
    setDailyAnsweredAt(null);
    setMarketLocation({
      label: "Location not shared",
      source: "not-requested",
      status: "idle",
    });
    setNotificationReady(false);
    setPoints(420);
    setSavedItems(3);
    setStreak(4);
    setToast({
      title: "Local account deleted",
      detail: "Preview profile, stored marketplace data, posts, and history were removed from this device.",
    });
  }

  function keepStreak(detail = "Your Human Streak is alive for today.") {
    void humanHaptic("light");
    setStreak((current) => current + 1);
    act("Streak kept", detail);
  }

  function earnPoints(amount: number, reason: string) {
    void humanHaptic("light");
    setPoints((current) => current + amount);
    act(`+${amount} Human Points`, reason);
  }

  function openPayment(payment: PaymentRequest) {
    setPaymentPrompt(payment);
  }

  async function enableHumanChainNotifications(context = "login") {
    try {
      await requestWorldPermission(Permission.Notifications);
      setNotificationReady(true);
      recordHistory({
        title: "Notifications enabled",
        detail:
          "Daily questions, direct inbox, marketplace bids, story drops, payments, and account alerts can now notify this human.",
        kind: "profile",
      });
      setToast({
        title: "Notifications ready",
        detail:
          context === "login"
            ? "HumanChain will only send functional World App alerts tied to your account and activity."
            : "Sector alerts are ready for every important HumanChain action.",
      });
    } catch (error) {
      setToast({
        title: "Notification permission",
        detail: error instanceof Error ? error.message : "Open inside World App and allow HumanChain notifications.",
      });
    }
  }

  async function enterWithWorld() {
    setGateBusy(true);

    try {
      const auth = await authenticateHumanWallet();
      const address = auth.verification?.address as string | undefined;

      if (!auth.verification?.ok || !address) {
        setToast({
          title: "World verification needed",
          detail: auth.verification?.error ?? "Open HumanChain inside World App and verify your wallet.",
        });
        return;
      }

      setVerifiedHuman({
        username: worldContext.username ? `@${worldContext.username}` : `@human_${address.slice(2, 8).toLowerCase()}`,
        wallet: address,
        mode: "world",
      });
      setToast({
        title: "Verified human entered",
        detail: `${address.slice(0, 6)}...${address.slice(-4)} is ready. Notification, location, chat, and payment actions stay user controlled.`,
      });
    } catch (error) {
      setToast({
        title: "World login failed",
        detail: error instanceof Error ? error.message : "Try again inside World App.",
      });
    } finally {
      setGateBusy(false);
    }
  }

  function enterPreview() {
    setVerifiedHuman({
      username: "@preview_human",
      mode: "preview",
    });
    setToast({
      title: "Preview opened",
      detail: "World wallet, payments, and permissions remain ready for the real Mini App.",
    });
  }

  async function confirmPayment() {
    if (!paymentPrompt) {
      return;
    }

    const amount = Number.parseInt(paymentPrompt.amount, 10);
    const feature = paymentPrompt.feature ?? normalizePaymentFeature(paymentPrompt.title);

    try {
      const result = await payWithWorld({
        amount,
        description: paymentPrompt.detail,
        feature,
      });

      if ("pendingSetup" in result && result.pendingSetup) {
        setToast({
          title: "World setup needed",
          detail: result.message,
        });
        return;
      }

      if ("pendingWorldApp" in result && result.pendingWorldApp) {
        setToast({
          title: "Open in World App",
          detail: result.message,
        });
        return;
      }

      if ("ok" in result && !result.ok) {
        setToast({
          title: "Payment not confirmed",
          detail: "World payments are only counted after backend verification.",
        });
        return;
      }

      if ("error" in result && result.error) {
        setToast({
          title: "Payment not prepared",
          detail: result.error,
        });
        return;
      }
    } catch (error) {
      setToast({
        title: "World payment failed",
        detail: error instanceof Error ? error.message : "Try again in World App.",
      });
      return;
    }

    const earnedPoints = paymentPrompt.points ?? 0;

    if (earnedPoints > 0) {
      setPoints((current) => current + earnedPoints);
    }

    setToast({
      title: `${paymentPrompt.amount} prepared`,
      detail: paymentPrompt.success,
    });
    setPaymentPrompt(null);
  }

  const activeView = (() => {
    switch (tab) {
      case "ask":
        return (
          <AskView
            act={act}
            earnPoints={earnPoints}
            keepStreak={keepStreak}
            openPayment={openPayment}
          />
        );
      case "chains":
        return (
          <ChainsView
            activeField={activeField}
            act={act}
            earnPoints={earnPoints}
            humanPosts={humanPosts}
            keepStreak={keepStreak}
            links={links}
            openPayment={openPayment}
            recordHistory={recordHistory}
            setActiveField={setActiveField}
            setHumanPosts={setHumanPosts}
            setLinks={setLinks}
          />
        );
      case "stories":
        return (
          <StoriesView
            act={act}
            earnPoints={earnPoints}
            keepStreak={keepStreak}
            openPayment={openPayment}
            setSavedItems={setSavedItems}
          />
        );
      case "market":
        return (
          <MarketplaceView
            act={act}
            earnPoints={earnPoints}
            marketLocation={marketLocation}
            marketplaceListings={marketplaceListings}
            openPayment={openPayment}
            recordHistory={recordHistory}
            setMarketLocation={setMarketLocation}
            setMarketplaceListings={setMarketplaceListings}
            worldContext={worldContext}
          />
        );
      case "me":
        return (
          <MeView
            act={act}
            clearMarketplaceData={clearMarketplaceData}
            clearPostData={clearPostData}
            deleteLocalAccount={deleteLocalAccount}
            earnPoints={earnPoints}
            keepStreak={keepStreak}
            historyRecords={historyRecords}
            humanPosts={humanPosts}
            marketplaceListings={marketplaceListings}
            marketLocation={marketLocation}
            points={points}
            recordHistory={recordHistory}
            resetHistory={resetHistory}
            savedItems={savedItems}
            streak={streak}
          />
        );
      default:
        return (
          <HomeView
            act={act}
            appLanguage={appLanguage}
            dailyAnswered={dailyAnswered}
            dailyAnsweredAt={dailyAnsweredAt}
            dailyResponses={dailyResponses}
            earnPoints={earnPoints}
            links={links}
            notificationReady={notificationReady}
            onChangeLanguage={setAppLanguage}
            onEnableNotifications={() => enableHumanChainNotifications("settings")}
            setDailyAnsweredAt={setDailyAnsweredAt}
            setActiveField={setActiveField}
            points={points}
            setDailyAnswered={setDailyAnswered}
            setDailyResponses={setDailyResponses}
            setTab={setTab}
            streak={streak}
            worldContext={worldContext}
          />
        );
    }
  })();

  return (
    <main className="app-shell">
      <section className="phone-frame">
        {verifiedHuman ? activeView : (
          <LoginGate
            appLanguage={appLanguage}
            busy={gateBusy}
            notificationReady={notificationReady}
            onEnableNotifications={() => enableHumanChainNotifications("login")}
            onPreview={enterPreview}
            onVerify={enterWithWorld}
            worldContext={worldContext}
          />
        )}
        {toast ? (
          <div className="toast" role="status">
            <CheckCircle2 size={18} />
            <div>
              <strong>{toast.title}</strong>
              <span>{toast.detail}</span>
            </div>
            <button onClick={() => setToast(null)} type="button">
              Close
            </button>
          </div>
        ) : null}
        {paymentPrompt ? (
          <PaymentSheet
            onCancel={() => setPaymentPrompt(null)}
            onConfirm={confirmPayment}
            payment={paymentPrompt}
          />
        ) : null}
        {verifiedHuman ? (
          <BottomNav active={tab} appLanguage={appLanguage} onChange={setTab} />
        ) : null}
      </section>
    </main>
  );
}

function LoginGate({
  appLanguage,
  busy,
  notificationReady,
  onEnableNotifications,
  onPreview,
  onVerify,
  worldContext,
}: {
  appLanguage: AppLanguage;
  busy: boolean;
  notificationReady: boolean;
  onEnableNotifications: () => void | Promise<void>;
  onPreview: () => void;
  onVerify: () => void | Promise<void>;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  return (
    <div className="login-gate">
      <section className="gate-card">
        <div className="gate-brand">
          <img alt="HumanChain logo" src="/images/humanchain-logo.svg" />
          <div>
            <span>World Mini App</span>
            <strong>HumanChain</strong>
          </div>
        </div>
        <div className="gate-orbit" aria-hidden="true">
          <span />
          <i />
          <b />
        </div>
        <h1>Enter as one real human.</h1>
        <p>
          Ask, answer, publish, read, trade nearby, and build a visible chain
          of wisdom with World wallet authentication, World Chat, bid alerts,
          and verified-human trust.
        </p>
        <div className="gate-context-strip">
          <span>Opened from {worldContext.launchLocation ?? "World App preview"}</span>
          <span>{worldContext.deviceOS ?? "Device"} ready</span>
          <span>{appLanguage.name} selected</span>
        </div>
        <div className="gate-notification-prompt">
          <Bell size={18} />
          <div>
            <strong>{notificationReady ? "Notifications allowed" : "Allow HumanChain notifications?"}</strong>
            <span>
              Get functional alerts for inbox messages, bids, accepted offers,
              daily questions, story drops, payments, and account safety. You
              can skip this and still enter.
            </span>
          </div>
          <button onClick={onEnableNotifications} type="button">
            {notificationReady ? "Ready" : "Allow"}
          </button>
        </div>
        <button className="gate-primary" disabled={busy} onClick={onVerify} type="button">
          <ShieldCheck size={19} />
          {busy ? "Checking World wallet..." : "Continue with World App"}
        </button>
        <button className="gate-secondary" onClick={onPreview} type="button">
          Preview HumanChain
        </button>
      </section>
      <section className="gate-trust-grid" aria-label="HumanChain entry features">
        <div>
          <BadgeCheck size={18} />
          <strong>Human first</strong>
          <span>Wallet auth protects the entry.</span>
        </div>
        <div>
          <CircleDollarSign size={18} />
          <strong>WLD commerce</strong>
          <span>Stories, boosts, listings, and ads use one payment flow.</span>
        </div>
        <div>
          <Radio size={18} />
          <strong>Permission clear</strong>
          <span>Notifications ask in context and stay functional.</span>
        </div>
      </section>
    </div>
  );
}

function HomeView({
  act,
  appLanguage,
  dailyAnswered,
  dailyAnsweredAt,
  dailyResponses,
  earnPoints,
  links,
  notificationReady,
  onChangeLanguage,
  onEnableNotifications,
  points,
  setDailyAnsweredAt,
  setActiveField,
  setDailyAnswered,
  setDailyResponses,
  setTab,
  streak,
  worldContext,
}: {
  act: (title: string, detail: string) => void;
  appLanguage: AppLanguage;
  dailyAnswered: boolean;
  dailyAnsweredAt: string | null;
  dailyResponses: DailyResponse[];
  earnPoints: EarnPoints;
  links: typeof initialLinks;
  notificationReady: boolean;
  onChangeLanguage: (language: AppLanguage) => void;
  onEnableNotifications: () => void | Promise<void>;
  points: number;
  setDailyAnsweredAt: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveField: React.Dispatch<React.SetStateAction<ChainField | null>>;
  setDailyAnswered: React.Dispatch<React.SetStateAction<boolean>>;
  setDailyResponses: React.Dispatch<React.SetStateAction<DailyResponse[]>>;
  setTab: (tab: Tab) => void;
  streak: number;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  const [dailyDraft, setDailyDraft] = useState("");
  const liveVerdicts = [
    {
      question: dailyHumanQuestion.title,
      result: `${dailyResponses.length} live answers recorded today`,
      truth:
        dailyResponses[0]?.text ??
        "Answer the Daily to help form the first real verdict.",
    },
    {
      question: "What should the world remember today?",
      result: `${links.length} chain links from verified humans`,
      truth: links[0]?.text ?? "The newest chain link will appear here.",
    },
  ];

  return (
    <div className="screen">
      <header className="hero">
        <div className="hero-brandline">
          <img alt="HumanChain logo" className="hero-logo" src="/images/humanchain-logo.svg" />
          <div>
            <span>Verified human network</span>
            <strong>HumanChain</strong>
          </div>
        </div>
        <h1>Where real humans carry wisdom forward.</h1>
        <p>
          Ask real people, read human stories, save field wisdom, trade with
          nearby humans, and build a visible chain of purpose inside World App.
        </p>
        <div className="home-proof-grid" aria-label="HumanChain highlights">
          <span>Daily human question</span>
          <span>Story vault</span>
          <span>Nearby marketplace</span>
          <span>Human points</span>
        </div>
      </header>

      <section className="quick-grid" aria-label="Main actions">
        <ActionButton
          icon={<MessageCircleQuestion size={20} />}
          label="Ask The World"
          detail="Real answers from verified humans"
          onClick={() => setTab("ask")}
        />
        <ActionButton
          icon={<Sparkles size={20} />}
          label="Join Today's Chain"
          detail="Add one link to the world"
          onClick={() => setTab("chains")}
        />
        <ActionButton
          icon={<Store size={20} />}
          label="Human Market"
          detail="Buy, sell, and promote nearby"
          onClick={() => setTab("market")}
        />
        <ActionButton
          icon={<BookOpen size={20} />}
          label="Story Vault"
          detail="Monthly and paid human stories"
          onClick={() => setTab("stories")}
        />
      </section>

      <section className="premium-grid" aria-label="HumanChain services">
        {premiumServices.map((service) => (
          <article className="service-card" key={service.title}>
            <div>
              <span>Core path</span>
              <h3>{service.title}</h3>
            </div>
            <p>{service.detail}</p>
          </article>
        ))}
      </section>

      <section className="panel home-command-center">
        <div className="section-heading">
          <span>Today on HumanChain</span>
          <Radio size={18} />
        </div>
        {[
          ["Answer", "Join the Daily Human Question before the verdict closes.", "Ask"],
          ["Connect", "Add one chain link from your field or lived experience.", "Chains"],
          ["Trade", "Check nearby verified listings and serious bid windows.", "Market"],
        ].map(([title, detail, action]) => (
          <button
            className="home-command-row"
            key={title}
            onClick={() => {
              if (action === "Ask") setTab("ask");
              if (action === "Chains") setTab("chains");
              if (action === "Market") setTab("market");
            }}
            type="button"
          >
            <div>
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
            <b>{action}</b>
          </button>
        ))}
      </section>

      <section className="streak-card">
        <div>
          <span className="section-kicker">Human Streak</span>
          <h2>{streak}-day chain alive</h2>
          <p>Add one meaningful action today to keep your chain growing.</p>
        </div>
        <button
          className="icon-action"
          onClick={() =>
            act("Human Streak", "Ask, answer, read, save, or join the chain.")
          }
          type="button"
        >
          <Flame size={22} />
        </button>
      </section>

      <section className="points-card">
        <div>
          <span className="section-kicker">Human Points</span>
          <h2>{points.toLocaleString()} HP</h2>
          <p>
            Earn now by helping the network. Points will prepare early humans
            for future rewards after launch.
          </p>
        </div>
        <div className="points-ring">
          <strong>{Math.min(100, Math.round(points / 10))}%</strong>
          <span>Level 2</span>
        </div>
      </section>

      <section className="daily-card">
        <div className="section-heading">
          <span>HumanChain Daily</span>
          <CalendarCheck size={18} />
        </div>
        <span className="daily-reward">{dailyHumanQuestion.reward}</span>
        <h2>{dailyHumanQuestion.title}</h2>
        <p>{dailyHumanQuestion.detail}</p>
        <textarea
          disabled={dailyAnswered}
          onChange={(event) => setDailyDraft(event.target.value)}
          placeholder="Write today's human answer..."
          value={
            dailyAnswered
              ? `Answered at ${dailyAnsweredAt ?? "today"}`
              : dailyDraft
          }
        />
        <div className="daily-actions">
          <button
            disabled={dailyAnswered}
            onClick={() => {
              if (dailyAnswered) {
                act("Already answered", "Come back tomorrow for a new global question.");
                return;
              }

              setDailyAnswered(true);
              const time = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              setDailyAnsweredAt(time);
              setDailyResponses((current) => [
                {
                  user: "@jonta254",
                  text:
                    dailyDraft.trim() ||
                    "Life taught me that a real answer can carry another human.",
                  time,
                },
                ...current,
              ]);
              earnPoints(18, "Your Daily Human answer entered today's global verdict.");
            }}
            type="button"
          >
            {dailyAnswered ? "Answered Today" : "Answer Daily"}
          </button>
          <button onClick={() => setTab("ask")} type="button">
            See answers
          </button>
        </div>
        <div className="daily-live">
          {dailyResponses.slice(0, 3).map((response) => (
            <article key={`${response.user}-${response.time}`}>
              <span>{response.user} · {response.time}</span>
              <p>{response.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>Trending Verdict</span>
          <Vote size={18} />
        </div>
        {liveVerdicts.map((verdict) => (
          <article className="verdict-card" key={verdict.question}>
            <h3>{verdict.question}</h3>
            <p className="verdict-result">{verdict.result}</p>
            <p className="quoted">&ldquo;{verdict.truth}&rdquo;</p>
            <button
              className="mini-command"
              onClick={() =>
                act("Verdict saved", "This wisdom was added to your library.")
              }
              type="button"
            >
              Save Verdict
            </button>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>Live human fields</span>
          <Users size={18} />
        </div>
        <div className="field-strip">
          {chainFields.map((field) => (
            <button
              key={field.name}
              onClick={() => {
                setActiveField(field);
                setTab("chains");
              }}
              type="button"
            >
              <strong>{field.name}</strong>
              <span>Open quote room</span>
            </button>
          ))}
        </div>
      </section>

      <section className="pulse-card">
        <div>
          <span className="section-kicker">Human Pulse</span>
          <h2>What the world is feeling</h2>
        </div>
        <div className="pulse-bars">
          <Meter label="Hope" value={32} />
          <Meter label="Love" value={21} />
          <Meter label="Stress" value={18} />
          <Meter label="Ambition" value={16} />
        </div>
      </section>

      <AppSettingsBar
        activeLanguage={appLanguage}
        notificationReady={notificationReady}
        onEnableNotifications={onEnableNotifications}
        onChange={onChangeLanguage}
        worldContext={worldContext}
      />
    </div>
  );
}

function AskView({
  act,
  earnPoints,
  keepStreak,
  openPayment,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  keepStreak: (detail?: string) => void;
  openPayment: OpenPayment;
}) {
  const [question, setQuestion] = useState("");
  const [selectedMode, setSelectedMode] = useState("Text");
  const [selectedTopic, setSelectedTopic] = useState("Life");
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [threads, setThreads] = useState(starterAskThreads);
  const [voiceMode, setVoiceMode] = useState(false);

  function publishQuestion() {
    const cleanQuestion =
      question.trim() || "How do I begin again when life feels heavy?";
    setThreads((current) => [
      {
        question: cleanQuestion,
        topic: selectedTopic,
        mode: selectedMode,
        answers: [
          {
            user: "@humanchain_ai",
            country: "World",
            text: "Your question is live. Verified humans will answer from experience, not from guessing.",
          },
        ],
      },
      ...current,
    ]);
    setQuestion("");
    earnPoints(20, "Useful questions build your future earning score.");
    keepStreak("Your question is live and the Human Verdict is forming.");
  }

  function answerThread(questionText: string) {
    const draft =
      answerDrafts[questionText]?.trim() ||
      "My honest answer: begin with the smallest action that proves life can still move.";

    setThreads((current) =>
      current.map((thread) =>
        thread.question === questionText
          ? {
              ...thread,
              answers: [
                {
                  user: "@jonta254",
                  country: "Verified human",
                  text: draft,
                },
                ...thread.answers,
              ],
            }
          : thread,
      ),
    );
    setAnswerDrafts((current) => ({ ...current, [questionText]: "" }));
    earnPoints(15, "Your answer helped another verified human.");
    keepStreak("Your answer joined the Human Ask board.");
  }

  return (
    <div className="screen">
      <TopBar title="Ask The World" subtitle="One question. Verified human answers." />
      <section className="ask-hero">
        <div>
          <span className="section-kicker">Human Ask</span>
          <h2>Ask people, not algorithms.</h2>
          <p>
            Choose a human route, publish one honest question, and watch real
            answers form into a living verdict.
          </p>
        </div>
        <button
          aria-pressed={voiceMode}
          className={voiceMode ? "voice-orb active" : "voice-orb"}
          onClick={() => {
            setVoiceMode((value) => !value);
            act(
              voiceMode ? "Voice mode paused" : "Voice mode ready",
              voiceMode
                ? "Text question mode is active."
                : "Microphone flow will record the question in World App.",
            );
          }}
          type="button"
        >
          <Mic size={24} />
        </button>
      </section>
      <section className="ask-box">
        <label htmlFor="question">What do you want to ask humanity?</label>
        <textarea
          id="question"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: Should I leave my job and start my own business?"
          value={question}
        />
        <div className="ask-modes">
          {[
            ["Text", "Public question", "Free"],
            ["Voice", "Hear my tone", "2 WLD"],
            ["Private", "Hide identity", "4 WLD"],
            ["Deep Verdict", "Human report", "6 WLD"],
          ].map(([mode, label, amount]) => (
            <button
              aria-pressed={selectedMode === mode}
              className={selectedMode === mode ? "active" : ""}
              key={mode}
              onClick={() => {
                setSelectedMode(mode);
                if (mode === "Text") {
                  act("Text mode", "Public text question selected.");
                  return;
                }

                openPayment({
                  title: `${mode} question`,
                  amount,
                  detail:
                    mode === "Voice"
                      ? "Ask with voice so verified humans hear your tone before answering."
                      : mode === "Private"
                        ? "Hide your public identity while verified humans answer."
                        : "Turn answers into most-said, best answer, country differences, hard truth, and final verdict.",
                  success: `${mode} flow is prepared for World App payment.`,
                  points: mode === "Deep Verdict" ? 12 : 6,
                });
              }}
              type="button"
            >
              <strong>{mode}</strong>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="chip-row">
          {["Life", "Love", "Money", "Business", "Family", "Culture", "Faith"].map((chip) => (
            <button
              aria-pressed={selectedTopic === chip}
              className={selectedTopic === chip ? "active" : ""}
              key={chip}
              onClick={() => {
                setSelectedTopic(chip);
                act("Topic selected", `${chip} answers will be prioritized.`);
              }}
              type="button"
            >
              {chip}
            </button>
          ))}
        </div>
        <button className="primary-command" onClick={publishQuestion} type="button">
          <Send size={18} />
          Ask Verified Humans
        </button>
      </section>

      <section className="ask-board">
        <div className="section-heading">
          <span>Live Human Questions</span>
          <MessageCircleQuestion size={18} />
        </div>
        {threads.map((thread, index) => (
          <article className="ask-thread" key={`${thread.question}-${index}`}>
            <div className="ask-thread-top">
              <span>{thread.topic}</span>
              <small>{thread.mode} route</small>
            </div>
            <h3>{thread.question}</h3>
            <Meter label={`${thread.answers.length} answers`} value={Math.min(92, 22 + thread.answers.length * 18)} />
            <div className="answer-stack">
              {thread.answers.map((answer) => (
                <div className="answer-card" key={`${thread.question}-${answer.user}-${answer.text}`}>
                  <strong>{answer.user} · {answer.country}</strong>
                  <p>{answer.text}</p>
                </div>
              ))}
            </div>
            <textarea
              aria-label={`Answer ${thread.question}`}
              className="answer-input"
              onChange={(event) =>
                setAnswerDrafts((current) => ({
                  ...current,
                  [thread.question]: event.target.value,
                }))
              }
              placeholder="Add your real human answer..."
              value={answerDrafts[thread.question] ?? ""}
            />
            <div className="thread-actions">
              <button onClick={() => answerThread(thread.question)} type="button">
                Answer
              </button>
              <button
                onClick={() =>
                  openPayment({
                    title: "Boost question",
                    amount: "2 WLD",
                    detail: "Invite more verified humans to answer this question.",
                    success: "Question boost is prepared for World App.",
                    points: 8,
                  })
                }
                type="button"
              >
                Boost reach
              </button>
              <button
                onClick={() =>
                  openPayment({
                    title: "Deep Verdict",
                    amount: "6 WLD",
                    detail: "Turn this question's answers into a human verdict report.",
                    success: "Deep Verdict is prepared for World App.",
                    points: 12,
                  })
                }
                type="button"
              >
                Build verdict
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="panel payment-hub">
        <div className="section-heading">
          <span>HumanPass payments</span>
          <CircleDollarSign size={18} />
        </div>
        <p>
          Paid actions now open one clean World App sheet. The amount appears
          only when a human chooses the premium action.
        </p>
        <div className="payment-pills">
          {wldActions.map(([, detail]) => (
            <span key={detail}>{detail}</span>
          ))}
        </div>
      </section>

      <section className="verdict-builder">
        <span className="section-kicker">Premium World Verdict</span>
        <h2>Turn answers into a real human report.</h2>
        <div className="verdict-parts">
        {worldVerdictParts.map((part) => (
            <button
              key={part}
              onClick={() => act(part, "This section appears when enough verified answers arrive.")}
              type="button"
            >
              {part}
            </button>
          ))}
        </div>
        <button
          className="primary-command"
          onClick={() =>
            openPayment({
              title: "Deep World Verdict",
              amount: "6 WLD",
              detail: "Unlock the full human report after enough verified answers arrive.",
              success: "Deep Verdict payment is ready for World App.",
              points: 12,
            })
          }
          type="button"
        >
          <CircleDollarSign size={18} />
          Build Deep Verdict
        </button>
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>Questions needing humans</span>
          <PenLine size={18} />
        </div>
        {answerQueue.map((prompt) => (
          <article className="question-row" key={prompt}>
            <p>{prompt}</p>
            <button
              onClick={() => {
                setQuestion(prompt);
                setSelectedMode("Text");
                act("Question loaded", "Edit it or ask verified humans now.");
              }}
              type="button"
            >
              Ask this
            </button>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading">
          <span>Answer formats</span>
          <Radio size={18} />
        </div>
        <div className="compact-actions">
          <button
            onClick={() => {
              openPayment({
                title: "Voice answer",
                amount: "2 WLD",
                detail: "Record up to 60 seconds and send an answer with human tone.",
                success: "Voice answer recorder is ready after payment.",
                points: 15,
              });
            }}
            type="button"
          >
            Unlock voice answer
          </button>
          <button onClick={() => act("Country answer", "Answer as your culture sees it.")} type="button">
            Country and culture answer
          </button>
          <button onClick={() => act("Anonymous answer", "Your identity stays private.")} type="button">
            Anonymous verified answer
          </button>
        </div>
      </section>
    </div>
  );
}

function ChainsView({
  activeField,
  act,
  earnPoints,
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
  humanPosts: HumanPost[];
  keepStreak: (detail?: string) => void;
  links: typeof initialLinks;
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
  setActiveField: React.Dispatch<React.SetStateAction<ChainField | null>>;
  setHumanPosts: React.Dispatch<React.SetStateAction<HumanPost[]>>;
  setLinks: React.Dispatch<React.SetStateAction<typeof initialLinks>>;
}) {
  const [linkText, setLinkText] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [isPublishingPost, setIsPublishingPost] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [chainView, setChainView] = useState<"images" | "quotes" | "groups">(
    "images",
  );

  function addLink() {
    const text =
      linkText.trim() || "I am still becoming, and today that is enough.";
    setLinks((current) => [{ country: "Verified Human", text }, ...current]);
    setLinkText("");
    earnPoints(12, "Your chain link added value to today's field.");
    keepStreak("Your link joined today's global chain.");
  }

  async function publishImagePost() {
    const caption =
      postCaption.trim() ||
      "A real human moment I want the chain to remember today.";
    const createdAt = new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    let imageUrl = postImage;
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
          imageUrl = payload.url;
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

    const post: HumanPost = {
      id: Date.now(),
      author: "@you",
      caption,
      image: imageUrl,
      theme: "gold",
      reactions: 0,
      loves: 0,
      tips: 0,
      comments: [],
      createdAt,
      owner: true,
      storageStatus,
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
    setPostImage(null);
    setPostFile(null);
    recordHistory({
      title: "Image post published",
      detail:
        storageStatus === "cloud-safe"
          ? `${caption} Image file stored safely. Post receipt is being saved.`
          : `${caption} Saved locally now; backend receipt will attach when storage is configured.`,
      kind: "post",
    });
    earnPoints(16, "Your human image post joined the visual chain.");
    keepStreak("You posted a human image into today's chain.");
  }

  function reactToPost(postId: number, reaction: string, field: "reactions" | "loves" = "reactions") {
    setHumanPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, [field]: post[field] + 1, reactions: field === "loves" ? post.reactions : post.reactions + 1 }
          : post,
      ),
    );
    recordHistory({
      title: `${reaction} sent`,
      detail: "You interacted with a human image post.",
      kind: field === "loves" ? "reaction" : "reaction",
    });
    earnPoints(5, `Your ${reaction} reaction added life to a human post.`);
    act("Reaction added", "You earned Human Points for reacting with meaning.");
  }

  function commentOnPost(postId: number) {
    const comment = commentDrafts[postId]?.trim();

    if (!comment) {
      act("Write a comment", "Add a real human response before sending.");
      return;
    }

    setHumanPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, comments: [`@you: ${comment}`, ...post.comments] }
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
      fieldQuoteRooms[activeField.name as keyof typeof fieldQuoteRooms];

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
    <div className="screen">
      <TopBar title="Human Fields" subtitle="Living chains for real humans." />
      <section className="image-chain-card">
        <span className="section-kicker">Human Image Chain</span>
        <h2>Post a real moment. Let humans react.</h2>
        <p>
          Share a photo from your day with a short human message. Every reaction
          adds energy to the chain and awards Human Points.
        </p>
        {postImage ? (
          <img alt="Selected human post" src={postImage} />
        ) : (
          <div className="image-post-placeholder">
            <Upload size={22} />
            <span>Your image stays inside this post preview.</span>
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
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setPostImage(String(reader.result));
                    setPostFile(file);
                    act("Image selected", "Add a caption, then publish it.");
                  };
                  reader.readAsDataURL(file);
                }
              }}
              type="file"
            />
          </label>
          <button disabled={isPublishingPost} onClick={publishImagePost} type="button">
            {isPublishingPost ? "Publishing..." : "Publish post"}
          </button>
        </div>
      </section>
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
      <section className="chain-tools">
        <button
          onClick={() => {
            earnPoints(6, "Starting a circle grows field activity.");
            act("Chain Circle", "Invite 12 verified humans around one topic.");
          }}
          type="button"
        >
          <Users size={17} />
          Circle
        </button>
        <button onClick={() => act("Chain Pulse", "See what this field is feeling today.")} type="button">
          <HeartHandshake size={17} />
          Pulse
        </button>
        <button
          onClick={() =>
            openPayment({
              title: "Golden Link",
              amount: "2 WLD",
              detail: "Pin your best chain link so more verified humans see it.",
              success: "Golden Link boost is prepared for World App.",
              points: 8,
            })
          }
          type="button"
        >
          <Star size={17} />
          Pin
        </button>
      </section>
      <section className="chain-map">
        <span className="section-kicker">World field</span>
        <h2>Post images, follow live links, or enter quote rooms.</h2>
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
          Image posts
        </button>
          <button
            className={chainView === "quotes" ? "active" : ""}
            onClick={() => setChainView("quotes")}
            type="button"
          >
          Live links
        </button>
        <button
          className={chainView === "groups" ? "active" : ""}
          onClick={() => setChainView("groups")}
          type="button"
        >
          Quote rooms
        </button>
      </div>
      {chainView === "images" ? (
        <section className="image-post-grid">
          <div className="chain-section-note">
            <span>Human image posts</span>
            <p>Photos and captions shared by verified humans. Reactions add Human Points and show what the chain is feeling.</p>
          </div>
          {humanPosts.map((post) => (
            <article className="image-post" key={post.id}>
              {post.image ? (
                <img alt={post.caption} src={post.image} />
              ) : (
                <div className={`generated-post-art ${post.theme}`}>
                  <span />
                  <i />
                  <b />
                </div>
              )}
              <div>
                <div className="post-head">
                  <div>
                    <strong>{post.author}</strong>
                    <small>{post.createdAt}</small>
                  </div>
                  {post.owner ? (
                    <button
                      className="delete-post-button"
                      onClick={() => deletePost(post.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <p>{post.caption}</p>
                <div className="post-metrics">
                  <span>{post.reactions} reactions</span>
                  <span>{post.loves} loves</span>
                  <span>{post.tips} tips</span>
                  <span>{post.comments.length} comments</span>
                </div>
                <div className="reaction-row social-actions">
                  <button onClick={() => reactToPost(post.id, "Love", "loves")} type="button">
                    Love
                  </button>
                  <button
                    onClick={() => {
                      setHumanPosts((current) =>
                        current.map((currentPost) =>
                          currentPost.id === post.id
                            ? { ...currentPost, tips: currentPost.tips + 1 }
                            : currentPost,
                        ),
                      );
                      recordHistory({
                        title: "Post tip prepared",
                        detail: `You prepared a WLD tip for ${post.author}.`,
                        kind: "tip",
                      });
                      openPayment({
                        title: "Tip human",
                        amount: "1 WLD",
                        detail: "Send a small thank-you to this human image post.",
                        success: "Post tip is ready for World App payment.",
                        points: 4,
                      });
                    }}
                    type="button"
                  >
                    Tip
                  </button>
                  {["I felt this", "Inspired", "Praying"].map((reaction) => (
                    <button
                      key={reaction}
                      onClick={() => reactToPost(post.id, reaction)}
                      type="button"
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
                <div className="comment-box">
                  <input
                    onChange={(event) =>
                      setCommentDrafts((current) => ({
                        ...current,
                        [post.id]: event.target.value,
                      }))
                    }
                    placeholder="Add a real comment..."
                    value={commentDrafts[post.id] ?? ""}
                  />
                  <button onClick={() => commentOnPost(post.id)} type="button">
                    Comment
                  </button>
                </div>
                {post.comments.length ? (
                  <div className="comment-list">
                    {post.comments.slice(0, 3).map((comment, index) => (
                      <span key={`${post.id}-${comment}-${index}`}>{comment}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
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
                <div>
                  <strong>{field.name}</strong>
                <span>Verified humans</span>
                </div>
                <p>{field.detail}</p>
                <button
                  onClick={() => {
                    earnPoints(6, `You entered ${field.name} and expanded your human map.`);
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
          <div className="chain-section-note live-note">
            <span>Live chain quotes</span>
            <p>This feed is only the links written by humans in Today&apos;s main chain. Add your link above and it appears here first.</p>
          </div>
          {links.map((link, index) => (
            <article className="thread-item" key={`${link.country}-${link.text}-${index}`}>
              <span className="thread-dot" />
              <div>
                <strong>{link.country}</strong>
                <p>{link.text}</p>
                <div className="reaction-row">
                  <button
                    onClick={() => act("Reaction sent", "You told this human: I felt this.")}
                    type="button"
                  >
                    I felt this
                  </button>
                  <button
                    onClick={() =>
                      openPayment({
                        title: "Tip chain link",
                        amount: "1 WLD",
                        detail: "Send a small thank-you to this verified human.",
                        success: "Tip is ready for World App payment.",
                        points: 4,
                      })
                    }
                    type="button"
                  >
                    Tip human
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function StoriesView({
  act,
  earnPoints,
  keepStreak,
  openPayment,
  setSavedItems,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  keepStreak: (detail?: string) => void;
  openPayment: OpenPayment;
  setSavedItems: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [isReading, setIsReading] = useState(false);
  const [activePublishedStory, setActivePublishedStory] =
    useState<PublishedStoryKey | null>(null);
  const [page, setPage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
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

  function saveStory() {
    setSavedItems((value) => value + 1);
    earnPoints(8, "Saved stories improve your Human Points record.");
    keepStreak("The monthly Human Story was saved to your library.");
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
                detail: "Support the human behind this story.",
                success: "Story tip is prepared for World App.",
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
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="Human Story" subtitle="A monthly story about being human." />
      <section className="story-cover">
        <StoryCoverPhoto
          alt="Colored cinematic cover for The Door That Waited showing a blue door and cracked cup"
          src={monthlyStoryCover}
        />
        <span>April Human Story</span>
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
      <section className="publish-card">
        <div>
          <span className="section-kicker">Publish to humans</span>
          <h2>Your life can become a chain.</h2>
          <p>
            Writers can upload a PDF or write inside the mini app. HumanChain
            formats it into a readable story, adds a cover, then opens likes,
            ratings, saves, and WLD tips.
          </p>
        </div>
        <label className="upload-drop">
          <Upload size={20} />
          Upload PDF or text
          <input
            accept=".pdf,.txt,.doc,.docx"
            onChange={() => {
              earnPoints(25, "Story submission draft started.");
              act("Story file selected", "Review and publish flow is ready.");
            }}
            type="file"
          />
        </label>
        <div className="publish-steps">
          {publishSteps.map((step, index) => (
            <span key={step}>
              {index + 1}. {step}
            </span>
          ))}
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
                detail: "Support the writer behind this story.",
                success: "Storyteller tip is prepared for World App.",
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

function MarketplaceView({
  act,
  earnPoints,
  marketLocation,
  marketplaceListings,
  openPayment,
  recordHistory,
  setMarketLocation,
  setMarketplaceListings,
  worldContext,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  marketLocation: MarketLocationState;
  marketplaceListings: MarketplaceListing[];
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
  setMarketLocation: React.Dispatch<React.SetStateAction<MarketLocationState>>;
  setMarketplaceListings: React.Dispatch<React.SetStateAction<MarketplaceListing[]>>;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  const [activeFilter, setActiveFilter] = useState("Near me");
  const [manualArea, setManualArea] = useState(() =>
    marketLocation.source === "manual"
      ? marketLocation.label.replace(/^Manual area:\s*/, "")
      : "Nairobi",
  );
  const [bidDrafts, setBidDrafts] = useState<Record<string, string>>({});
  const [marketBids, setMarketBids] = useState<Record<string, MarketBid[]>>(() =>
    loadJsonFromStorage<Record<string, MarketBid[]>>(
      storageKeys.bids,
      getInitialMarketBids(),
    ),
  );
  const [listingPhotos, setListingPhotos] = useState<
    Array<{ id: number; name: string; src: string }>
  >([]);
  const [listingDraft, setListingDraft] = useState({
    area: "",
    bidFloor: "",
    condition: "",
    details: "",
    duration: "3 days",
    link: "",
    price: "",
    saleMode: "direct" as MarketplaceListing["saleMode"],
    title: "",
  });

  const filteredItems = marketplaceItems.filter((item) => {
    if (activeFilter === "New") return item.condition === "New listed";
    if (activeFilter === "Second hand") return item.condition === "Second hand";
    if (activeFilter === "Marketing") return item.tag === "Marketing";
    return true;
  });
  const locationReady = marketLocation.status === "ready";
  const worldLaunchLabel = formatWorldLaunchLocation(worldContext.launchLocation);

  useEffect(() => {
    saveJsonToStorage(storageKeys.bids, marketBids);
  }, [marketBids]);

  function publishListing(plan: (typeof marketplacePlans)[number]) {
    openPayment({
      title: `${plan[0]} marketplace fee`,
      amount: plan[1],
      detail: `${plan[2]} Payment stays small so humans can do business without heavy publishing friction.`,
      success: `${plan[0]} is ready. Add your item, photos, location, and contact link after wallet setup.`,
      feature: normalizePaymentFeature(`marketplace-${plan[0]}`),
      points: 12,
    });
    recordHistory({
      title: `${plan[0]} prepared`,
      detail: `${plan[1]} marketplace action opened through World payment.`,
      kind: "market",
    });
  }

  function updateListingDraft(field: keyof typeof listingDraft, value: string) {
    setListingDraft((current) => ({ ...current, [field]: value }));
  }

  function requestMarketplaceLocation() {
    if (marketLocation.status === "requesting") {
      return;
    }

    setMarketLocation((current) => ({
      ...current,
      label: "Requesting browser location...",
      status: "requesting",
    }));

    if (!navigator.geolocation) {
      setMarketLocation({
        label: "GPS unavailable. Use the area field instead.",
        source: "unavailable",
        status: "denied",
      });
      act(
        "Location unavailable",
        "World MiniKit does not provide GPS. This device/browser has no geolocation, so use manual area matching.",
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { accuracy, latitude, longitude } = position.coords;
        const gpsLabel = `GPS shared: ${latitude.toFixed(3)}, ${longitude.toFixed(3)} (${Math.round(accuracy)}m)`;

        setMarketLocation({
          accuracy,
          label: gpsLabel,
          lat: latitude,
          lng: longitude,
          source: "browser-gps",
          status: "ready",
        });
        updateListingDraft("area", gpsLabel);
        earnPoints(5, "Nearby marketplace is now ranked with your explicit browser location consent.");
      },
      (error) => {
        setMarketLocation({
          label: error.code === error.PERMISSION_DENIED ? "Location not allowed" : "Location could not be read",
          source: "unavailable",
          status: "denied",
        });
        act(
          "Location not connected",
          "You can still browse by manually entering your area. HumanChain will not guess or store GPS without consent.",
        );
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 10_000,
      },
    );
  }

  function applyManualMarketplaceArea() {
    const area = manualArea.trim();

    if (!area) {
      act("Area needed", "Enter a town, estate, or pickup zone to rank nearby listings manually.");
      return;
    }

    setMarketLocation({
      label: `Manual area: ${area}`,
      source: "manual",
      status: "ready",
    });
    updateListingDraft("area", area);
    earnPoints(3, "Manual marketplace area connected without GPS.");
  }

  function saveMarketplaceListing() {
    const title = listingDraft.title.trim() || "Untitled marketplace listing";
    const listing: MarketplaceListing = {
      id: Date.now(),
      title,
      price: listingDraft.price.trim() || "Price not set",
      bidFloor: listingDraft.bidFloor.trim(),
      duration: listingDraft.duration.trim() || "3 days",
      saleMode: listingDraft.saleMode,
      condition: listingDraft.condition || "Condition not set",
      area: listingDraft.area.trim() || "Nearby area not set",
      link: listingDraft.link.trim(),
      details: listingDraft.details.trim(),
      photos: listingPhotos,
      status: "payment-ready",
      createdAt: new Intl.DateTimeFormat("en", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
      }).format(new Date()),
      dataStorageStatus: "local-safe",
    };

    setMarketplaceListings((current) => [listing, ...current]);
    void storeSafeData("marketplace-listing", listing.id, listing).then((receipt) => {
      if (!receipt.ok) {
        return;
      }

      setMarketplaceListings((current) =>
        current.map((item) =>
          item.id === listing.id
            ? {
                ...item,
                dataReceiptUrl: receipt.url,
                dataStorageStatus: "cloud-safe",
              }
            : item,
        ),
      );
    });
    recordHistory({
      title: "Marketplace listing stored",
      detail: `${title} saved with ${listingPhotos.length} photo${listingPhotos.length === 1 ? "" : "s"} and can be published after payment. A safe data receipt is being prepared.`,
      kind: "market",
    });
    earnPoints(10, "Your marketplace listing was stored in HumanChain history.");
    setListingDraft({
      area: "",
      bidFloor: "",
      condition: "",
      details: "",
      duration: "3 days",
      link: "",
      price: "",
      saleMode: "direct",
      title: "",
    });
    setListingPhotos([]);
  }

  function handleListingPhotos(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const selectedFiles = Array.from(files);
    const includedFiles = selectedFiles.slice(0, 3);

    setListingPhotos([]);

    includedFiles.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = () => {
        setListingPhotos((current) => [
          ...current,
          {
            id: Date.now() + index,
            name: file.name,
            src: String(reader.result),
          },
        ]);
      };

      reader.readAsDataURL(file);
    });

    if (selectedFiles.length > 3) {
      publishListing(marketplacePlans[1]);
      act(
        "Extra photos reserved",
        "The first 3 photos are included. Extra photos need the small photo-pack fee before publishing.",
      );
    } else {
      act("Photos added", `${includedFiles.length} listing photo slot${includedFiles.length > 1 ? "s" : ""} ready.`);
    }
  }

  async function shareMarketItem(item: MarketplaceItem) {
    try {
      await shareWithWorld({
        title: `${item.title} on HumanChain Market`,
        text: `${item.title} - ${item.price} near ${item.location}. ${item.condition}, ${item.photos} photos, seller ${item.seller}.`,
        url: process.env.NEXT_PUBLIC_APP_URL,
      });
      act("Listing shared", "World share opened for this marketplace item.");
    } catch (error) {
      act("Share unavailable", error instanceof Error ? error.message : "Try sharing from World App.");
    }
  }

  async function openSellerChat(item: MarketplaceItem) {
    const sellerUsername = item.seller.replace(/^@/, "");

    try {
      await chatWithWorld({
        message: `Hi ${item.seller}, I saw ${item.title} on HumanChain Market. Is it still available near ${item.location}?`,
        to: [sellerUsername],
      });
      recordHistory({
        title: "Marketplace chat opened",
        detail: `World Chat opened for ${item.title} with ${item.seller}.`,
        kind: "market",
      });
      act("World Chat opened", `${item.seller}'s Human Chat inbox is ready for this listing.`);
    } catch (error) {
      act("Chat unavailable", error instanceof Error ? error.message : "Try opening the seller from World App.");
    }
  }

  function getTopBid(item: MarketplaceItem) {
    const offers = marketBids[item.title] ?? [];

    return offers.reduce<MarketBid | null>(
      (best, offer) => (!best || offer.amount > best.amount ? offer : best),
      null,
    );
  }

  function getMinimumNextBid(item: MarketplaceItem) {
    if (!item.bidding) {
      return 0;
    }

    const topBid = getTopBid(item);

    return topBid ? Math.max(item.bidding.floor, topBid.amount + 0.5) : item.bidding.floor;
  }

  function setQuickBid(item: MarketplaceItem, amount: number) {
    setBidDrafts((current) => ({
      ...current,
      [item.title]: amount.toFixed(amount % 1 === 0 ? 0 : 1),
    }));
  }

  async function placeBid(item: MarketplaceItem) {
    if (!item.bidding) {
      act("Direct sale item", "This listing uses chat-first buying instead of timed bidding.");
      return;
    }

    const nextBid = Number.parseFloat(bidDrafts[item.title] ?? "");
    const minimumNextBid = getMinimumNextBid(item);

    if (!Number.isFinite(nextBid) || nextBid < minimumNextBid) {
      act(
        "Bid too low",
        `Enter at least ${minimumNextBid} WLD so your offer beats the current bid and stays serious.`,
      );
      return;
    }

    const bidId = (marketBids[item.title]?.length ?? 0) + 1;
    const bid: MarketBid = {
      amount: nextBid,
      buyer: "@you",
      createdAt: new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
      id: bidId,
      note:
        nextBid >= item.bidding.target
          ? "Meets seller target. Ready to accept."
          : "Saved offer. Seller can accept or wait.",
      status: "saved",
      dataStorageStatus: "local-safe",
    };

    setMarketBids((current) => ({
      ...current,
      [item.title]: [bid, ...(current[item.title] ?? [])],
    }));
    void storeSafeData("marketplace-bid", `${item.title}-${bid.id}`, {
      ...bid,
      listing: item.title,
      seller: item.seller,
      sellerTarget: item.bidding.target,
    }).then((receipt) => {
      if (!receipt.ok) {
        return;
      }

      setMarketBids((current) => ({
        ...current,
        [item.title]: (current[item.title] ?? []).map((offer) =>
          offer.id === bidId
            ? {
                ...offer,
                dataReceiptUrl: receipt.url,
                dataStorageStatus: "cloud-safe",
              }
            : offer,
        ),
      }));
    });
    setBidDrafts((current) => ({ ...current, [item.title]: "" }));
    recordHistory({
      title: nextBid >= item.bidding.target ? "Target bid placed" : "Marketplace bid placed",
      detail: `${nextBid} WLD bid placed on ${item.title}. The bid is saved, ranked automatically, and sent to seller chat when available.`,
      kind: "market",
    });

    try {
      await chatWithWorld({
        message: `I placed a ${nextBid} WLD bid on ${item.title}. Let me know if this is close enough to accept.`,
        to: [item.seller.replace(/^@/, "")],
      });
      setMarketBids((current) => ({
        ...current,
        [item.title]: (current[item.title] ?? []).map((offer) =>
          offer.id === bidId ? { ...offer, status: "sent" } : offer,
        ),
      }));
      act("Bid sent to seller", "World Chat opened so the buyer and seller can confirm details directly.");
    } catch (error) {
      act("Bid saved", error instanceof Error ? error.message : "Bid is saved in the mini app preview.");
    }
  }

  return (
    <div className="screen marketplace-screen">
      <section className="market-hero">
        <div className="market-hero-top">
          <div>
            <span className="section-kicker">HumanChain Market</span>
            <h1>Buy, sell, and promote nearby.</h1>
          </div>
          <Store size={30} />
        </div>
        <p>
          A verified human marketplace for new items, second-hand goods,
          services, business links, and local discovery inside World App.
        </p>
        <div className="market-location-card">
          <MapPin size={18} />
          <div>
            <strong>{locationReady ? "Nearby market active" : "Connect nearby market"}</strong>
            <span>
              {locationReady ? marketLocation.label : "Share browser GPS or enter an area for nearby ranking."}
            </span>
            <small>
              {marketLocation.source === "browser-gps"
                ? "GPS active after consent."
                : marketLocation.source === "manual"
                  ? "Manual area active and saved."
                  : "No nearby location shared yet."}{" "}
              Opened from {worldLaunchLabel}.
            </small>
          </div>
          <button
            disabled={marketLocation.status === "requesting"}
            onClick={requestMarketplaceLocation}
            type="button"
          >
            {marketLocation.status === "requesting" ? "..." : "GPS"}
          </button>
        </div>
        <div className="manual-location-row">
          <input
            aria-label="Manual marketplace area"
            onChange={(event) => setManualArea(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyManualMarketplaceArea();
              }
            }}
            placeholder="Area, e.g. Westlands"
            value={manualArea}
          />
          <button onClick={applyManualMarketplaceArea} type="button">
            Use area
          </button>
        </div>
        <small className="market-transparency-note">
          Transparency: World launch context says this session opened from {worldLaunchLabel}.
          Nearby ranking uses browser GPS or manual area only after you choose it.
        </small>
      </section>

      <section className="market-actions">
        <button
          onClick={() => publishListing(marketplacePlans[0])}
          type="button"
        >
          <PlusCircle size={19} />
          <span>Sell item</span>
          <strong>1 WLD</strong>
        </button>
        <button
          onClick={() => publishListing(marketplacePlans[3])}
          type="button"
        >
          <HandCoins size={19} />
          <span>Market business</span>
          <strong>4 WLD</strong>
        </button>
      </section>

      <section className="market-panel market-flow-panel">
        <div className="section-heading">
          <span>Marketplace flow</span>
          <Gavel size={18} />
        </div>
        {[
          ["Seller publishes", "Pay the small listing fee, add photos, set direct sale or timed bidding."],
          ["Buyer interacts", "Browse freely, open Human Chat, share listing, or place a bid near the seller target."],
          ["Seller chooses", "Seller accepts the best serious offer or continues the listing until the duration ends."],
          ["Humans confirm", "Final meetup, delivery, and payment confirmation stay transparent in chat/history."],
        ].map(([title, detail]) => (
          <article className="market-flow-step" key={title}>
            <strong>{title}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </section>

      <section className="market-panel listing-studio">
        <div className="section-heading">
          <span>Create seller listing</span>
          <Upload size={18} />
        </div>
        <div className="listing-photo-zone">
          <label className="listing-upload">
            <Upload size={20} />
            <strong>Add item photos</strong>
            <span>3 photos included. More photos trigger an extra photo pack.</span>
            <input
              accept="image/*"
              multiple
              onChange={(event) => handleListingPhotos(event.target.files)}
              type="file"
            />
          </label>
          <div className="listing-photo-grid">
            {[0, 1, 2].map((slot) => {
              const photo = listingPhotos[slot];

              return (
                <div className={photo ? "filled" : ""} key={slot}>
                  {photo ? <img alt={photo.name} src={photo.src} /> : <span>{slot + 1}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="listing-fields">
          <input
            aria-label="Item title"
            onChange={(event) => updateListingDraft("title", event.target.value)}
            placeholder="Item title, e.g. iPhone 12 clean"
            value={listingDraft.title}
          />
          <input
            aria-label="Price"
            onChange={(event) => updateListingDraft("price", event.target.value)}
            placeholder="Target price, e.g. 18 WLD or KES 12,000"
            value={listingDraft.price}
          />
          <select
            aria-label="Sale mode"
            onChange={(event) =>
              updateListingDraft(
                "saleMode",
                event.target.value as MarketplaceListing["saleMode"],
              )
            }
            value={listingDraft.saleMode}
          >
            <option value="direct">Direct chat sale</option>
            <option value="bidding">Timed bidding</option>
          </select>
          <input
            aria-label="Minimum bid"
            onChange={(event) => updateListingDraft("bidFloor", event.target.value)}
            placeholder="Minimum bid, e.g. 15 WLD"
            value={listingDraft.bidFloor}
          />
          <select
            aria-label="Listing duration"
            onChange={(event) => updateListingDraft("duration", event.target.value)}
            value={listingDraft.duration}
          >
            <option>24 hours</option>
            <option>3 days</option>
            <option>7 days</option>
            <option>14 days</option>
          </select>
          <select
            aria-label="Condition"
            onChange={(event) => updateListingDraft("condition", event.target.value)}
            value={listingDraft.condition}
          >
            <option disabled value="">Condition</option>
            <option>New listed</option>
            <option>Second hand</option>
            <option>Refurbished</option>
            <option>Service or business</option>
          </select>
          <input
            aria-label="Pickup area"
            onChange={(event) => updateListingDraft("area", event.target.value)}
            placeholder="Pickup area or delivery route"
            value={listingDraft.area}
          />
          <input
            aria-label="Business or product link"
            onChange={(event) => updateListingDraft("link", event.target.value)}
            placeholder="Optional link: shop, WhatsApp, website"
            value={listingDraft.link}
          />
          <textarea
            aria-label="Listing details"
            onChange={(event) => updateListingDraft("details", event.target.value)}
            placeholder="Short details: size, defects, warranty, delivery, why buyers should trust it."
            value={listingDraft.details}
          />
        </div>
        <div className="listing-checklist">
          {marketplaceChecklist.map((item) => (
            <span key={item}>
              <CheckCircle2 size={14} />
              {item}
            </span>
          ))}
        </div>
        <button
          className="primary-command"
          onClick={() => {
            saveMarketplaceListing();
            publishListing(marketplacePlans[0]);
          }}
          type="button"
        >
          Store and publish - 1 WLD
        </button>
      </section>

      {marketplaceListings.length ? (
        <section className="market-panel stored-market-panel">
          <div className="section-heading">
            <span>Stored marketplace history</span>
            <Library size={18} />
          </div>
          {marketplaceListings.slice(0, 4).map((listing) => (
            <article className="stored-market-row" key={listing.id}>
              <div>
                <strong>{listing.title}</strong>
                <span>
                  {listing.price} - {listing.condition} - {listing.photos.length} photos
                </span>
                <small>
                  {listing.saleMode === "bidding"
                    ? `Bidding ${listing.duration}, floor ${listing.bidFloor || "not set"}`
                    : "Direct chat sale"}{" "}
                  - {listing.area} - {listing.createdAt} - {listing.dataStorageStatus === "cloud-safe" ? "safe receipt" : "local safe"}
                </small>
              </div>
              <button
                onClick={() => {
                  publishListing(marketplacePlans[2]);
                  recordHistory({
                    title: "Marketplace boost reopened",
                    detail: `${listing.title} was selected for local boost.`,
                    kind: "market",
                  });
                }}
                type="button"
              >
                Boost
              </button>
            </article>
          ))}
        </section>
      ) : null}

      <section className="market-signal-grid">
        {marketplaceSignals.map((signal) => (
          <span key={signal}>{signal}</span>
        ))}
      </section>

      <section className="market-panel">
        <div className="section-heading">
          <span>Discover near you</span>
          <ShoppingBag size={18} />
        </div>
        <div className="market-filter-row">
          {["Near me", "New", "Second hand", "Marketing"].map((filter) => (
            <button
              className={activeFilter === filter ? "active" : ""}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="market-list">
          {filteredItems.map((item) => (
            <article className={`market-item ${item.tone}`} key={item.title}>
              <div className="market-item-art">
                <Tag size={22} />
              </div>
              <div>
                <div className="market-item-top">
                  <strong>{item.title}</strong>
                  <span>{item.price}</span>
                </div>
                <p>
                  {item.condition} by {item.seller} in {item.location}
                </p>
                <div className="market-item-meta">
                  <span>{item.distance}</span>
                  <span>{item.tag}</span>
                  <span>{item.photos} photos</span>
                  <span>{item.trust}</span>
                </div>
                <small>{item.quality}</small>
                {item.bidding ? (
                  <div className="bid-console">
                    <div className="bid-console-top">
                      <span>
                        <Gavel size={14} />
                        Bidding closes {item.bidding.ends}
                      </span>
                      <strong>
                        Best {getTopBid(item)?.amount ?? item.bidding.floor} WLD
                      </strong>
                    </div>
                    <p>
                      Seller target {item.bidding.target} WLD. Next bid must be
                      at least {getMinimumNextBid(item)} WLD. No staff needed:
                      the app ranks offers and opens seller chat.
                    </p>
                    <div className="quick-bid-row" aria-label={`Quick bids for ${item.title}`}>
                      {[getMinimumNextBid(item), item.bidding.target].map((amount) => (
                        <button
                          key={`${item.title}-${amount}`}
                          onClick={() => setQuickBid(item, amount)}
                          type="button"
                        >
                          {amount} WLD
                        </button>
                      ))}
                    </div>
                    <div className="bid-row">
                      <input
                        aria-label={`Bid amount for ${item.title}`}
                        inputMode="decimal"
                        onChange={(event) =>
                          setBidDrafts((current) => ({
                            ...current,
                            [item.title]: event.target.value,
                          }))
                        }
                        placeholder={`${item.bidding.floor}+ WLD`}
                        value={bidDrafts[item.title] ?? ""}
                      />
                      <button onClick={() => void placeBid(item)} type="button">
                        Bid
                      </button>
                    </div>
                    <div className="bid-stack">
                      {(marketBids[item.title] ?? []).slice(0, 3).map((bid) => (
                        <span key={`${bid.id}-${bid.buyer}-${bid.amount}-${bid.note}`}>
                          {bid.buyer}: {bid.amount} WLD - {bid.note} - {bid.status === "sent" ? "sent" : "saved"} - {bid.dataStorageStatus === "cloud-safe" ? "safe receipt" : "local safe"}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="direct-chat-note">
                    Direct inbox sale. Buyers use Human Chat or the listing link.
                  </div>
                )}
              </div>
              <div className="market-card-actions">
                <button
                  onClick={() => {
                    void openSellerChat(item);
                  }}
                  type="button"
                >
                  Human Chat
                </button>
                <button
                  onClick={() => {
                    void shareMarketItem(item);
                  }}
                  type="button"
                >
                  Share
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="market-panel market-plan-panel">
        <div className="section-heading">
          <span>Small publishing fees</span>
          <CircleDollarSign size={18} />
        </div>
        {marketplacePlans.map((plan) => (
          <button
            className="market-plan"
            key={plan[0]}
            onClick={() => publishListing(plan)}
            type="button"
          >
            <div>
              <strong>{plan[0]}</strong>
              <span>{plan[2]}</span>
            </div>
            <b>{plan[1]}</b>
          </button>
        ))}
        <p>
          Buyers can browse and chat freely. Sellers and advertisers pay a small
          publishing fee, choose direct inbox sale or timed bidding, and receive
          offer alerts so the marketplace stays serious, affordable, and clean.
        </p>
      </section>

      <section className="market-panel">
        <div className="section-heading">
          <span>Business marketing</span>
          <Send size={18} />
        </div>
        <div className="market-link-box">
          <strong>Promote a shop, service, event, page, or WhatsApp link.</strong>
          <p>
            Ads can include a verified owner, location, short pitch, image,
            external link, and contact button. Links stay visible but are
            clearly marked as marketing.
          </p>
          <button
            onClick={() => publishListing(marketplacePlans[3])}
            type="button"
          >
            Prepare business ad
          </button>
          <button
            onClick={() => {
              void shareWithWorld({
                title: "HumanChain Market business ad",
                text: "Promote a verified local shop, service, event, or link inside HumanChain Market.",
                url: process.env.NEXT_PUBLIC_APP_URL,
              });
            }}
            type="button"
          >
            Share ad preview
          </button>
        </div>
      </section>
    </div>
  );
}

function MeView({
  act,
  clearMarketplaceData,
  clearPostData,
  deleteLocalAccount,
  earnPoints,
  historyRecords,
  humanPosts,
  keepStreak,
  marketLocation,
  marketplaceListings,
  points,
  recordHistory,
  resetHistory,
  savedItems,
  streak,
}: {
  act: (title: string, detail: string) => void;
  clearMarketplaceData: () => void;
  clearPostData: () => void;
  deleteLocalAccount: () => void;
  earnPoints: EarnPoints;
  historyRecords: HistoryRecord[];
  humanPosts: HumanPost[];
  keepStreak: (detail?: string) => void;
  marketLocation: MarketLocationState;
  marketplaceListings: MarketplaceListing[];
  points: number;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
  resetHistory: () => void;
  savedItems: number;
  streak: number;
}) {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  return (
    <div className="screen">
      <TopBar title="Treasure Profile" subtitle="Your verified human chain." />
      <section className="chain-score-card">
        <span className="section-kicker">Chain Score</span>
        <h2>{Math.round(points / 8 + streak * 9)}</h2>
        <p>
          Built from points, streak, answers, saved stories, verified badges,
          tips, and countries reached.
        </p>
        <div className="score-bars">
          <Meter label="Helpfulness" value={76} />
          <Meter label="Trust" value={68} />
          <Meter label="Reach" value={54} />
        </div>
      </section>
      <section className="treasure-profile">
        <div className="treasure-mark">
          <div className="avatar">
            {profileImage ? <img alt="Uploaded profile" src={profileImage} /> : "J"}
          </div>
          <BadgeCheck size={22} />
        </div>
        <div>
          <span className="section-kicker">Human username</span>
          <h2>@jonta254</h2>
          <p>Verified Chain Keeper. {streak}-day Human Streak.</p>
        </div>
        <button
          onClick={() => {
            earnPoints(10, "Daily check-in points added before launch.");
            keepStreak("Daily check-in sealed your Human Chain.");
          }}
          type="button"
        >
          <CalendarCheck size={17} />
          Check in
        </button>
        <label className="profile-upload">
          <Upload size={16} />
          Upload profile image
          <input
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              const reader = new FileReader();

              reader.onload = () => {
                setProfileImage(String(reader.result));
                recordHistory({
                  title: "Profile image updated",
                  detail: "Your HumanChain profile now has a personal image.",
                  kind: "profile",
                });
              };
              reader.readAsDataURL(file);
              earnPoints(5, "Profile image added to your human identity.");
            }}
            type="file"
          />
        </label>
      </section>
      <section className="chain-id-card">
        <div>
          <span>Chain ID</span>
          <strong>HC-JONTA-254</strong>
        </div>
        <ShieldCheck size={28} />
        <p>
          This profile represents one real verified human. Username becomes the
          public chain handle across questions, stories, tips, and fields.
        </p>
      </section>
      <section className="profile-command-grid">
        <button
          onClick={async () => {
            try {
              await requestWorldPermission(Permission.Notifications);
              act(
                "Notifications ready",
                "World App can send functional alerts for inbox, bids, accepted offers, stories, payments, rewards, and safety. You can turn them off in World App settings.",
              );
            } catch (error) {
              act("Notification permission", error instanceof Error ? error.message : "Try again inside World App.");
            }
          }}
          type="button"
        >
          <Radio size={18} />
          <span>Notifications</span>
          <strong>Every sector ready</strong>
        </button>
        <button
          onClick={async () => {
            try {
              const auth = await authenticateHumanWallet();
              act(
                auth.verification?.ok ? "Wallet connected" : "Wallet checked",
                auth.verification?.address
                  ? `${auth.verification.address.slice(0, 6)}...${auth.verification.address.slice(-4)} is ready for HumanChain.`
                  : "Wallet auth is ready. Add App ID details before launch.",
              );
            } catch (error) {
              act("Wallet auth failed", error instanceof Error ? error.message : "Try again inside World App.");
            }
          }}
          type="button"
        >
          <Wallet size={18} />
          <span>Creator wallet</span>
          <strong>Connect</strong>
        </button>
      </section>
      <section className="panel notification-sector-panel">
        <div className="section-heading">
          <span>Notification sectors</span>
          <Bell size={18} />
        </div>
        {[
          ["Direct inbox", "New World Chat messages from buyers, sellers, and chain replies."],
          ["Marketplace", "New bids, higher competing bids, accepted offers, boosts, and listing expiry."],
          ["Daily chain", "Daily question reminders, answer reactions, streak saves, and Human Points."],
          ["Stories", "Monthly story drops, saved-story replies, tips, and reader milestones."],
          ["Payments", "WLD payment prepared, confirmed, failed, refunded, or pending setup."],
          ["Account safety", "Wallet login, permission changes, data controls, and verification events."],
        ].map(([title, detail]) => (
          <article className="notification-sector" key={title}>
            <strong>{title}</strong>
            <span>{detail}</span>
          </article>
        ))}
        <p>
          World requires notifications to be enabled in the Developer Portal,
          allowed by the user through MiniKit, and sent only for relevant
          functional mini-app activity.
        </p>
      </section>
      <section className="panel notification-sector-panel">
        <div className="section-heading">
          <span>World app context</span>
          <MapPin size={18} />
        </div>
        {[
          ["Launch source", "HumanChain can read whether it opened from chat, home, app store, deep link, or wallet tab."],
          ["Device metadata", "World App may provide OS, app version, and safe-area information for layout."],
          ["Nearby market", "GPS is not taken from World context. The user must tap GPS or type an area."],
          ["Privacy rule", "No analytics should be collected when World context says optional analytics is off."],
        ].map(([title, detail]) => (
          <article className="notification-sector" key={title}>
            <strong>{title}</strong>
            <span>{detail}</span>
          </article>
        ))}
      </section>
      <section className="stats-grid">
        <Stat label="Points" value={String(points)} />
        <Stat label="Questions" value="3" />
        <Stat label="Answers" value="18" />
        <Stat label="Links" value="9" />
        <Stat label="Saved" value={String(savedItems)} />
      </section>
      <section className="panel human-history-panel">
        <div className="section-heading">
          <span>My post history</span>
          <Library size={18} />
        </div>
        {humanPosts.filter((post) => post.owner).length ? (
          humanPosts
            .filter((post) => post.owner)
            .map((post) => (
              <article className="history-post-card" key={post.id}>
                {post.image ? (
                  <img alt={post.caption} src={post.image} />
                ) : (
                  <div className="history-post-symbol" />
                )}
                <div>
                  <strong>{post.caption}</strong>
                  <span>
                    {post.createdAt} - {post.loves} loves - {post.comments.length} comments - {post.storageStatus === "cloud-safe" ? "safe receipt" : "local safe"}
                  </span>
                </div>
              </article>
            ))
        ) : (
          <p>Your published image posts will appear here and stay until you delete them.</p>
        )}
      </section>
      <section className="panel human-history-panel">
        <div className="section-heading">
          <span>Marketplace vault</span>
          <Store size={18} />
        </div>
        <article className="market-vault-row">
          <div>
            <strong>Nearby market location</strong>
            <span>{marketLocation.label}</span>
            <small>
              {marketLocation.status === "ready"
                ? `Active by ${marketLocation.source === "browser-gps" ? "GPS consent" : "manual area"}`
                : "Not active yet. Open Market and tap GPS or use area."}
            </small>
          </div>
          <button onClick={() => act("Nearby market", marketLocation.label)} type="button">
            View
          </button>
        </article>
        {marketplaceListings.length ? (
          marketplaceListings.slice(0, 5).map((listing) => (
            <article className="market-vault-row" key={listing.id}>
              <div>
                <strong>{listing.title}</strong>
                <span>
                  {listing.price} - {listing.condition} - {listing.photos.length} photos
                </span>
                <small>{listing.area} - {listing.status}</small>
                <small>
                  {listing.saleMode === "bidding"
                    ? `Bid window ${listing.duration}, floor ${listing.bidFloor || "not set"}`
                    : "Direct inbox/chat sale"}
                </small>
                <small>{listing.dataStorageStatus === "cloud-safe" ? "Safe data receipt attached" : "Saved locally until backend receipt is available"}</small>
              </div>
              <button
                onClick={() =>
                  act(
                    "Marketplace listing opened",
                    `${listing.title} is stored in your HumanChain marketplace history.`,
                  )
                }
                type="button"
              >
                View
              </button>
            </article>
          ))
        ) : (
          <p>Your stored marketplace listings, business ads, and paid boosts will appear here.</p>
        )}
      </section>
      <section className="panel human-history-panel">
        <div className="section-heading">
          <span>Human activity record</span>
          <Radio size={18} />
        </div>
        {historyRecords.slice(0, 8).map((record) => (
          <article className={`history-record ${record.kind}`} key={record.id}>
            <span>{record.time}</span>
            <div>
              <strong>{record.title}</strong>
              <p>{record.detail}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="panel points-ledger">
        <div className="section-heading">
          <span>Point rules</span>
          <Star size={18} />
        </div>
        {pointRules.map(([action, reward]) => (
          <div className="point-rule" key={action}>
            <span>{action}</span>
            <strong>{reward}</strong>
          </div>
        ))}
        <p>
          Human Points are not withdrawable yet. They track early value so real
          contributors can be recognized when HumanChain launches rewards.
        </p>
      </section>
      <section className="panel account-control-panel">
        <div className="section-heading">
          <span>Data and account controls</span>
          <LockKeyhole size={18} />
        </div>
        <p>
          HumanChain stores preview data on this device until backend storage is
          connected. You can remove stored listings, posts, history, or the
          whole local account view.
        </p>
        <div className="account-control-grid">
          <button onClick={clearMarketplaceData} type="button">
            <Store size={17} />
            <span>Clear marketplace</span>
          </button>
          <button onClick={clearPostData} type="button">
            <Upload size={17} />
            <span>Clear posts</span>
          </button>
          <button onClick={resetHistory} type="button">
            <Radio size={17} />
            <span>Reset history</span>
          </button>
          <button className="danger" onClick={deleteLocalAccount} type="button">
            <LockKeyhole size={17} />
            <span>Delete local account</span>
          </button>
        </div>
      </section>
      <section className="badge-cloud">
        {profileBadges.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading">
          <span>Human vault</span>
          <BookOpen size={18} />
        </div>
        {["Saved Verdicts", "Monthly Stories", "Voice Notes", "Best Advice"].map(
          (item) => (
            <button
              className="library-row"
              key={item}
              onClick={() => act(item, "Opened from your Human Vault.")}
              type="button"
            >
              {item}
            </button>
          ),
        )}
      </section>
      <section className="panel">
        <div className="section-heading">
          <span>Quick tools</span>
          <Search size={18} />
        </div>
        <div className="compact-actions">
          <button onClick={() => act("Connection map", "Countries linked to your chain are loading.")} type="button">
            <Compass size={17} />
            Find countries I connected with
          </button>
          <button onClick={() => act("Deep Human Mirror", "Premium reflection flow is ready.")} type="button">
            <LockKeyhole size={17} />
            Open Deep Human Mirror
          </button>
          <button onClick={async () => {
            try {
              await requestWorldPermission(Permission.Microphone);
              act("Microphone ready", "Voice answers can request microphone access in World App.");
            } catch (error) {
              act("Microphone permission", error instanceof Error ? error.message : "Try again inside World App.");
            }
          }} type="button">
            <Wallet size={17} />
            Enable voice access
          </button>
        </div>
      </section>
    </div>
  );
}

function PaymentSheet({
  onCancel,
  onConfirm,
  payment,
}: {
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  payment: PaymentRequest;
}) {
  return (
    <section className="payment-backdrop" role="dialog" aria-modal="true">
      <div className="payment-sheet">
        <span className="section-kicker">World App payment</span>
        <h2>{payment.title}</h2>
        <strong>{payment.amount}</strong>
        <p>{payment.detail}</p>
        {payment.points ? (
          <small>Confirming this also records +{payment.points} HP value.</small>
        ) : null}
        <div className="payment-actions">
          <button onClick={onCancel} type="button">
            Cancel
          </button>
          <button onClick={onConfirm} type="button">
            Prepare Payment
          </button>
        </div>
      </div>
    </section>
  );
}

function AppSettingsBar({
  activeLanguage,
  notificationReady,
  onEnableNotifications,
  onChange,
  worldContext,
}: {
  activeLanguage: AppLanguage;
  notificationReady: boolean;
  onEnableNotifications: () => void | Promise<void>;
  onChange: (language: AppLanguage) => void;
  worldContext: ReturnType<typeof getWorldMiniAppContext>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="app-settings-bar" aria-label="Mini app settings">
      <button
        aria-expanded={open}
        className="settings-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Settings size={17} />
        <span>{activeLanguage.settingsTitle}</span>
      </button>
      {open ? (
        <div className="settings-popover">
          <div className="settings-section">
            <strong>Language / Lugha</strong>
            <div className="settings-language-row">
              {appLanguages.map((language) => (
                <button
                  className={activeLanguage.code === language.code ? "active" : ""}
                  key={language.code}
                  onClick={() => {
                    onChange(language);
                    setOpen(false);
                  }}
                  type="button"
                >
                  {language.name}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-section">
            <strong>{activeLanguage.title}</strong>
            {activeLanguage.points.map((point) => (
              <p key={point}>{point}</p>
            ))}
          </div>
          <div className="settings-section compact">
            <strong>World context</strong>
            <span>Opened from {worldContext.launchLocation ?? "World App preview"}</span>
            <span>{worldContext.deviceOS ?? "Device"} ready</span>
          </div>
          <button
            className="settings-notification"
            onClick={onEnableNotifications}
            type="button"
          >
            <Bell size={15} />
            {notificationReady ? "Notifications ready" : "Allow notifications"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function BottomNav({
  active,
  appLanguage,
  onChange,
}: {
  active: Tab;
  appLanguage: AppLanguage;
  onChange: (tab: Tab) => void;
}) {
  const items: Array<[Tab, string, React.ReactNode]> = [
    ["home", appLanguage.nav.home, <Home key="home" size={20} />],
    ["ask", appLanguage.nav.ask, <MessageCircleQuestion key="ask" size={20} />],
    ["chains", appLanguage.nav.chains, <Sparkles key="chains" size={20} />],
    ["market", appLanguage.nav.market, <Store key="market" size={20} />],
    ["stories", appLanguage.nav.stories, <BookOpen key="stories" size={20} />],
    ["me", appLanguage.nav.me, <UserRound key="me" size={20} />],
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {items.map(([key, label, icon]) => (
        <button
          aria-current={active === key ? "page" : undefined}
          className={active === key ? "active" : ""}
          key={key}
          onClick={() => onChange(key)}
          type="button"
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function ActionButton({
  icon,
  label,
  detail,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button className="action-card" onClick={onClick} type="button">
      {icon}
      <strong>{label}</strong>
      <span>{detail}</span>
    </button>
  );
}

function TopBar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="top-bar">
      <span className="section-kicker">{subtitle}</span>
      <h1>{title}</h1>
    </header>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <i style={{ width: `${value}%` }} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
