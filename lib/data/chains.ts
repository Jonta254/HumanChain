import type { AskThread, ChainLink } from "@/types/chain";

// Canonical map from a chain link's country/topic field to its human handle.
// Shared by ChainsView and MeView so both panels always show the same author.
export const chainLinkHandleBySource: Record<string, string> = {
  Brazil: "@joy_survives", Business: "@builder_ama", Canada: "@quiet_courage",
  Care: "@care_voice", Culture: "@culture_keeper", Discipline: "@future_self",
  Faith: "@faith_link", Family: "@family_room", Ghana: "@goodname_ghana",
  Health: "@healing_chain", HumanChain: "@humanchain", Identity: "@seen_human",
  India: "@discipline_daily", Japan: "@quiet_words", Kenya: "@mara_chain",
  Love: "@love_practice", Mexico: "@workbench_mx", Money: "@money_room",
  Nigeria: "@goodname_nigeria", Philippines: "@care_bridge", Portugal: "@slow_light",
  Prayer: "@prayer_link", Purpose: "@purpose_field", "South Africa": "@ubuntu_builder",
  Uganda: "@healing_ug", Wisdom: "@wisdom_vault", Work: "@craft_human",
  World: "@world_human", Youth: "@youth_signal",
};

export function getChainLinkAuthor(link: ChainLink, fallback = "@verified_human"): string {
  if (link.country.startsWith("@")) return link.country;
  return chainLinkHandleBySource[link.country] ?? fallback;
}

export const initialLinks: ChainLink[] = [
  { country: "Kenya",         text: "Start before life feels perfect." },
  { country: "Brazil",        text: "Joy is also a form of survival." },
  { country: "India",         text: "Discipline is love for your future self." },
  { country: "Japan",         text: "Silence can be care when words are tired." },
  { country: "Ghana",         text: "A good name is built in the small moments nobody records." },
  { country: "Philippines",   text: "Begin with what your hands can do today." },
  { country: "Portugal",      text: "Peace is sometimes a bill paid early and a call returned honestly." },
  { country: "South Africa",  text: "The truth gets lighter when it is carried by more than one person." },
  { country: "Mexico",        text: "Family is not perfect people. It is people learning to return." },
  { country: "Canada",        text: "When the day is heavy, do the next kind thing." },
  { country: "Nigeria",       text: "Your name is your credit. Guard it with your life." },
  { country: "Uganda",        text: "The person who shows up quietly for others is remembered loudly." },
  { country: "India",         text: "Discipline is the only bridge between who you are and who you want to be." },
  { country: "Brazil",        text: "Work worth doing rarely announces itself. Start anyway." },
  { country: "Canada",        text: "Loneliness and solitude are not the same. One drains, one restores." },
  { country: "Indonesia",     text: "Gratitude is not a feeling. It is a practice that changes what you are able to see." },
  { country: "Egypt",         text: "The person who listens twice before speaking once builds rooms other people want to stay in." },
  { country: "Ethiopia",      text: "Hunger for knowledge is not a luxury. It is how the overlooked become unforgettable." },
  { country: "Colombia",      text: "Resilience is not refusing to break. It is breaking quietly and then beginning again." },
  { country: "Pakistan",      text: "Honour the table even when it is not full. Dignity does not require abundance." },
  { country: "Vietnam",       text: "Build slowly. Things that take long to build are usually worth protecting." },
  { country: "Jamaica",       text: "Laughter in a hard season is not denial. It is people refusing to be completely taken." },
];

export const starterAskThreads: AskThread[] = [
  {
    question: "How do I start again after losing confidence?",
    author: "@humanchain",
    owner: false,
    topic: "Life",
    mode: "Text",
    targetCountry: "World",
    answers: [
      { user: "@mara_chain",    country: "Kenya",  text: "Start with one promise you can keep before sunset. Confidence returns through evidence." },
      { user: "@renato_human",  country: "Brazil", text: "Tell one safe person the truth. Shame gets weaker when it stops being private." },
    ],
  },
  {
    question: "Should I chase money first or build skill first?",
    author: "@humanchain",
    owner: false,
    topic: "Money",
    mode: "Country",
    targetCountry: "World",
    answers: [
      { user: "@builder_ama",  country: "Ghana",    text: "Build the skill that can earn in many rooms. Money follows usefulness more often than noise." },
      { user: "@tomas_work",   country: "Portugal", text: "Earn enough to breathe, then invest time in the skill that compounds." },
    ],
  },
  {
    question: "What habit changed your financial life the most?",
    author: "@humanchain",
    owner: false,
    topic: "Money",
    mode: "Text",
    targetCountry: "World",
    answers: [
      { user: "@discipline_daily", country: "India",  text: "Writing every expense down — not budgeting, just awareness. The waste became visible immediately." },
      { user: "@quiet_courage",    country: "Canada", text: "Treating savings like a bill paid first, before any spending. Automatic transfer on payday." },
    ],
  },
  {
    question: "How do you forgive someone who never apologized?",
    author: "@humanchain",
    owner: false,
    topic: "Family",
    mode: "Text",
    targetCountry: "World",
    answers: [
      { user: "@care_bridge", country: "Philippines", text: "Forgiveness is releasing yourself. They don't have to know. You're doing it to carry less weight." },
      { user: "@faith_link",  country: "Nigeria",     text: "I chose to see the wound they were carrying that made them hurt me. It didn't excuse — it explained." },
    ],
  },
  {
    question: "What should every entrepreneur know before quitting their job?",
    author: "@humanchain",
    owner: false,
    topic: "Business",
    mode: "Text",
    targetCountry: "World",
    answers: [
      { user: "@builder_ama",   country: "Ghana",  text: "Run the business in evenings for 90 days. Revenue proves the idea before the risk." },
      { user: "@workbench_mx",  country: "Mexico", text: "Know your first paying customer before you quit. Not a friend — a stranger who found value and paid." },
    ],
  },
  {
    question: "What truth about love took you the longest to understand?",
    author: "@humanchain",
    owner: false,
    topic: "Love",
    mode: "Text",
    targetCountry: "World",
    answers: [
      { user: "@joy_survives", country: "Brazil",   text: "Love is a verb, not a feeling. It fades when you stop choosing it." },
      { user: "@slow_light",   country: "Portugal", text: "You cannot give love you don't believe you deserve. Receiving matters as much as giving." },
    ],
  },
  {
    question: "What do you wish you knew at 20 that you know now?",
    author: "@humanchain",
    owner: false,
    topic: "Life",
    mode: "Text",
    targetCountry: "World",
    answers: [
      { user: "@ubuntu_builder",  country: "South Africa", text: "That discomfort is not a sign you're failing — it's a sign you're growing. I avoided too much." },
      { user: "@culture_keeper",  country: "Ghana",        text: "To invest in two deep friendships instead of maintaining twenty shallow ones." },
    ],
  },
  {
    question: "How do you stay motivated when your progress is invisible?",
    author: "@humanchain",
    owner: false,
    topic: "Life",
    mode: "Text",
    targetCountry: "World",
    answers: [
      { user: "@future_self",   country: "India", text: "I track inputs, not outcomes. Did I show up today? That's the only metric I control." },
      { user: "@youth_signal",  country: "Kenya", text: "I write the version of me I'm becoming. Reading it during hard weeks reminds me why I started." },
    ],
  },
  {
    question: "How do you raise children to be proud of where they come from?",
    author: "@humanchain",
    owner: false,
    topic: "Family",
    mode: "Country",
    targetCountry: "World",
    answers: [
      { user: "@culture_keeper", country: "Ghana",       text: "We cook the food, tell the stories, and let them ask questions without embarrassment. Pride is taught at the table." },
      { user: "@care_voice",     country: "Philippines", text: "I show them the struggles honestly — not to sadden them but so they know what we survived. That creates rootedness." },
    ],
  },
  {
    question: "What does it mean to be wealthy in your community — not just financially?",
    author: "@humanchain",
    owner: false,
    topic: "Money",
    mode: "Country",
    targetCountry: "World",
    answers: [
      { user: "@ubuntu_builder", country: "South Africa", text: "In my community, a wealthy person is called when there is trouble. Not because they have money — because they have character." },
      { user: "@healing_ug",     country: "Uganda",       text: "Wealth here means your children eat, your parents are cared for, and your neighbour knows your name in a good way." },
    ],
  },
  {
    question: "What is the most important thing you do for your mental health?",
    author: "@humanchain",
    owner: false,
    topic: "Health",
    mode: "Text",
    targetCountry: "World",
    answers: [
      { user: "@quiet_words",  country: "Japan",  text: "I walk without a destination for thirty minutes each morning. No phone. Just the sound of the city waking up." },
      { user: "@faith_link",   country: "Nigeria", text: "I write one honest sentence every night about how I actually feel — not how I should feel. It clears the mind." },
    ],
  },
  {
    question: "What did your culture teach you about work that most people do not understand?",
    author: "@humanchain",
    owner: false,
    topic: "Work",
    mode: "Country",
    targetCountry: "World",
    answers: [
      { user: "@wisdom_vault",    country: "Wisdom",  text: "That rest is not laziness — it is the preparation before the next effort. We do not separate rest and work." },
      { user: "@craft_human",     country: "Work",    text: "That the person who shows up every day without drama is more valuable than the genius who arrives twice a year." },
    ],
  },
];
