"use client";

import {
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Flame,
  Globe2,
  Home,
  Library,
  MessageCircleQuestion,
  PenLine,
  Search,
  Send,
  Sparkles,
  UserRound,
  Vote,
} from "lucide-react";
import { useMemo, useState } from "react";

const worldSignals = [
  "Kenya is answering money questions",
  "Brazil is active in love",
  "India joined today's chain",
  "Japan sent 42 voice notes",
  "Nigeria is trending in business",
];

const verdicts = [
  {
    question: "Should I start over at 30?",
    result: "52% say yes, but plan carefully",
    truth: "You are not late. You are unprepared.",
  },
  {
    question: "What do people regret most about love?",
    result: "41% say silence during small moments",
    truth: "Pride is expensive when the heart is involved.",
  },
];

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
];

const storyImageByPage: Record<
  number,
  {
    alt: string;
    art: StoryArtKind;
  }
> = {
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

const storyPages = storyBeats.map((text, index) => {
  const image =
    storyImageByPage[index + 1] ??
    (text.length < 260
      ? {
          alt: "Symbolic paper art reflecting this story moment",
          art: ambientStoryArt[index % ambientStoryArt.length],
        }
      : null);
  const nextText = storyBeats[index + 1];

  return {
    page: index + 1,
    text,
    image,
    nextHint: nextText
      ? `Next: ${createStoryHint(nextText)}`
      : "Next: add your own link to the chain.",
  };
});

function createStoryHint(text: string) {
  const cleaned = text.replace(/^Human message:\s*/i, "");
  const firstSentence = cleaned.split(".")[0];

  return firstSentence.length > 78
    ? `${firstSentence.slice(0, 78).trim()}...`
    : firstSentence;
}

const wldActions = [
  ["1 WLD", "Tip, Golden Link, or streak restore"],
  ["2 WLD", "Pin a link or unlock story pages"],
  ["3 WLD", "Ask one country or save a capsule"],
  ["4 WLD", "Ask privately as a verified human"],
  ["5 WLD", "Request voice answers"],
  ["6 WLD", "Unlock Deep Human Verdict"],
];

type Tab = "home" | "ask" | "chains" | "stories" | "me";

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

export default function HumanChainApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [toast, setToast] = useState<Toast | null>(null);
  const [streak, setStreak] = useState(4);
  const [links, setLinks] = useState(initialLinks);
  const [savedItems, setSavedItems] = useState(3);

  function act(title: string, detail: string) {
    setToast({ title, detail });
  }

  function keepStreak(detail = "Your Human Streak is alive for today.") {
    setStreak((current) => current + 1);
    act("Streak kept", detail);
  }

  const activeView = useMemo(() => {
    switch (tab) {
      case "ask":
        return <AskView act={act} keepStreak={keepStreak} />;
      case "chains":
        return (
          <ChainsView
            act={act}
            keepStreak={keepStreak}
            links={links}
            setLinks={setLinks}
          />
        );
      case "stories":
        return (
          <StoriesView
            act={act}
            keepStreak={keepStreak}
            setSavedItems={setSavedItems}
          />
        );
      case "me":
        return <MeView savedItems={savedItems} streak={streak} />;
      default:
        return (
          <HomeView
            act={act}
            setTab={setTab}
            streak={streak}
          />
        );
    }
  }, [links, savedItems, streak, tab]);

  return (
    <main className="app-shell">
      <section className="phone-frame">
        {activeView}
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
        <BottomNav active={tab} onChange={setTab} />
      </section>
    </main>
  );
}

function HomeView({
  act,
  setTab,
  streak,
}: {
  act: (title: string, detail: string) => void;
  setTab: (tab: Tab) => void;
  streak: number;
}) {
  return (
    <div className="screen">
      <header className="hero">
        <div className="eyebrow">
          <Globe2 size={16} />
          Verified human network
        </div>
        <h1>HumanChain</h1>
        <p>Ask real humans. Follow the thread. Get the world's verdict.</p>
        <div className="signal-strip" aria-label="Live global activity">
          {worldSignals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
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
          icon={<BookOpen size={20} />}
          label="Read Human Story"
          detail="Monthly issue live now"
          onClick={() => setTab("stories")}
        />
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

      <section className="panel">
        <div className="section-heading">
          <span>Trending Verdict</span>
          <Vote size={18} />
        </div>
        {verdicts.map((verdict) => (
          <article className="verdict-card" key={verdict.question}>
            <h3>{verdict.question}</h3>
            <p className="verdict-result">{verdict.result}</p>
            <p className="quoted">"{verdict.truth}"</p>
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
    </div>
  );
}

function AskView({
  act,
  keepStreak,
}: {
  act: (title: string, detail: string) => void;
  keepStreak: (detail?: string) => void;
}) {
  const [question, setQuestion] = useState("");
  const [published, setPublished] = useState<string | null>(null);

  function publishQuestion() {
    const cleanQuestion =
      question.trim() || "How do I begin again when life feels heavy?";
    setPublished(cleanQuestion);
    keepStreak("Your question is live and the Human Verdict is forming.");
  }

  return (
    <div className="screen">
      <TopBar title="Ask The World" subtitle="One question. Verified human answers." />
      <section className="ask-box">
        <label htmlFor="question">What do you want to ask humanity?</label>
        <textarea
          id="question"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: Should I leave my job and start my own business?"
          value={question}
        />
        <div className="chip-row">
          {["Love", "Money", "Business", "Family", "Culture"].map((chip) => (
            <button
              key={chip}
              onClick={() => act("Topic selected", `${chip} answers will be prioritized.`)}
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

      {published ? (
        <section className="live-card">
          <span className="section-kicker">World Verdict forming</span>
          <h2>{published}</h2>
          <p>12 verified humans invited. 3 countries are answering.</p>
          <Meter label="Verdict progress" value={38} />
        </section>
      ) : null}

      <section className="panel">
        <div className="section-heading">
          <span>WLD Reach</span>
          <CircleDollarSign size={18} />
        </div>
        <div className="wld-grid">
          {wldActions.map(([price, detail]) => (
            <button
              className="wld-button"
              key={price}
              onClick={() => act(`${price} selected`, detail)}
              type="button"
            >
              <strong>{price}</strong>
              <span>{detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>Questions needing humans</span>
          <PenLine size={18} />
        </div>
        {[
          "How do I stop feeling behind in life?",
          "What does love mean in your country?",
          "What business can I start with little money?",
        ].map((prompt) => (
          <article className="question-row" key={prompt}>
            <p>{prompt}</p>
            <button
              onClick={() => {
                keepStreak("Your answer helped another verified human.");
              }}
              type="button"
            >
              Answer
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

function ChainsView({
  act,
  keepStreak,
  links,
  setLinks,
}: {
  act: (title: string, detail: string) => void;
  keepStreak: (detail?: string) => void;
  links: typeof initialLinks;
  setLinks: React.Dispatch<React.SetStateAction<typeof initialLinks>>;
}) {
  const [linkText, setLinkText] = useState("");

  function addLink() {
    const text =
      linkText.trim() || "I am still becoming, and today that is enough.";
    setLinks((current) => [{ country: "Verified Human", text }, ...current]);
    setLinkText("");
    keepStreak("Your link joined today's global chain.");
  }

  return (
    <div className="screen">
      <TopBar title="Daily Human Chain" subtitle="All verified humans can add one link." />
      <section className="today-chain">
        <span className="section-kicker">Today's Chain</span>
        <h2>What should the world remember today?</h2>
        <p>
          Open to verified humans globally. Add one sentence, voice thought, or
          memory that another human may need.
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
      <section className="thread-list" aria-label="Human thread">
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
                  onClick={() => act("1 WLD tip ready", "This will open MiniKit Pay in World App.")}
                  type="button"
                >
                  Tip 1 WLD
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function StoriesView({
  act,
  keepStreak,
  setSavedItems,
}: {
  act: (title: string, detail: string) => void;
  keepStreak: (detail?: string) => void;
  setSavedItems: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [isReading, setIsReading] = useState(false);
  const [page, setPage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const current = storyPages[page];

  function saveStory() {
    setSavedItems((value) => value + 1);
    keepStreak("The monthly Human Story was saved to your library.");
  }

  if (isReading) {
    return (
      <div className="screen story-reader-screen">
        <section className="reader-top">
          <button onClick={() => setIsReading(false)} type="button">
            Cover
          </button>
          <span>
            Page {current.page} / {storyPages.length}
          </span>
          <button
            onClick={() =>
              act("1 WLD tip ready", "This will support the storyteller in World App.")
            }
            type="button"
          >
            Tip
          </button>
        </section>
        <article className="story-page">
          {current.image ? (
            <StoryPaperArt alt={current.image.alt} kind={current.image.art} />
          ) : null}
          <span className="section-kicker">The Door That Waited</span>
          <p>{current.text}</p>
          <div className="story-thread-note">
            <span>Next thread</span>
            <strong>{current.nextHint}</strong>
          </div>
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
            disabled={page === storyPages.length - 1}
            onClick={() =>
              setPage((value) => Math.min(storyPages.length - 1, value + 1))
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
        <StoryCoverArt />
        <span>April Human Story</span>
        <h2>The Door That Waited</h2>
        <p>
          A monthly life story about a blue door, a cracked cup, and the small
          openings that help a human return.
        </p>
        <button
          onClick={() => {
            setIsReading(true);
            keepStreak("You opened this month's Human Story.");
          }}
          type="button"
        >
          Read Story
        </button>
      </section>
      <section className="story-pages">
        {[
          {
            art: "closed-door" as const,
            title: "The blue door",
          },
          {
            art: "key-ticket" as const,
            title: "Three objects",
          },
          {
            art: "open-window" as const,
            title: "The first opening",
          },
          {
            art: "repaired-cup" as const,
            title: "The gold line",
          },
        ].map((chapter, index) => (
          <article
            key={chapter.title}
            onClick={() => {
              setPage(index * 25);
              setIsReading(true);
            }}
          >
            <StoryPaperArt alt={`${chapter.title} symbol`} kind={chapter.art} />
            <span>Chapter {index + 1}</span>
            <h3>{chapter.title}</h3>
          </article>
        ))}
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
            onClick={() => act("1 WLD tip ready", "Support the storyteller.")}
            type="button"
          >
            1 WLD Tip Storyteller
          </button>
          <button
            onClick={() => act("2 WLD bonus ready", "Unlock author notes and reader reflections.")}
            type="button"
          >
            2 WLD Bonus Pages
          </button>
          <button
            onClick={() => act("6 WLD reflection ready", "Create your Deep Story Reflection.")}
            type="button"
          >
            6 WLD Deep Reflection
          </button>
        </div>
      </section>
    </div>
  );
}

function StoryCoverArt() {
  return (
    <div
      aria-label="Photorealistic Human Story cover showing a person at a blue door holding a phone"
      className="cover-art cover-photo"
      role="img"
    >
      <div className="cover-photo-mark">
        <span />
      </div>
    </div>
  );
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

function MeView({
  savedItems,
  streak,
}: {
  savedItems: number;
  streak: number;
}) {
  return (
    <div className="screen">
      <TopBar title="My Human Passport" subtitle="Your chain across the world." />
      <section className="profile-card">
        <div className="avatar">HC</div>
        <div>
          <h2>Verified Human</h2>
          <p>Chain Keeper. {streak}-day Human Streak.</p>
        </div>
      </section>
      <section className="stats-grid">
        <Stat label="Questions" value="3" />
        <Stat label="Answers" value="18" />
        <Stat label="Links" value="9" />
        <Stat label="Saved" value={String(savedItems)} />
      </section>
      <section className="panel">
        <div className="section-heading">
          <span>Human Library</span>
          <BookOpen size={18} />
        </div>
        {["Saved Verdicts", "Monthly Stories", "Voice Notes", "Best Advice"].map(
          (item) => (
            <button className="library-row" key={item} type="button">
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
          <button type="button">Find countries I connected with</button>
          <button type="button">Open Deep Human Mirror</button>
          <button type="button">Review WLD activity</button>
        </div>
      </section>
    </div>
  );
}

function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  const items: Array<[Tab, string, React.ReactNode]> = [
    ["home", "Home", <Home key="home" size={20} />],
    ["ask", "Ask", <MessageCircleQuestion key="ask" size={20} />],
    ["chains", "Chains", <Sparkles key="chains" size={20} />],
    ["stories", "Stories", <BookOpen key="stories" size={20} />],
    ["me", "Me", <UserRound key="me" size={20} />],
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
