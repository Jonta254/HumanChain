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
    url: string;
  }
> = {
  1: {
    alt: "Realistic hands from different backgrounds holding small objects that matter",
    url: storyArtUrl(
      "premium pencil sketch on warm paper close up of human hands from different backgrounds holding small meaningful objects coins photo ticket key soft morning light global human story delicate graphite lines subtle gold accent no text",
      2041,
    ),
  },
  2: {
    alt: "Futuristic realistic global map of glowing human threads across cities",
    url: storyArtUrl(
      "premium pencil sketch on warm paper futuristic global human network seen from above warm gold threads connecting cities and tiny human figures holding phones delicate graphite crosshatching subtle gold accent no text",
      2042,
    ),
  },
  5: {
    alt: "A phone screen glowing in a quiet break room with a human question open",
    url: storyArtUrl(
      "premium pencil sketch on warm paper phone glowing on a quiet break room table with coffee and folded uniform nearby emotional human question mood delicate graphite shading subtle gold light no readable text",
      2050,
    ),
  },
  9: {
    alt: "A tired nurse typing an honest sentence into her phone during a late shift",
    url: storyArtUrl(
      "premium pencil sketch on warm paper tired nurse in a quiet hospital corridor typing an honest message into her phone during a late shift emotional human vulnerability graphite lines subtle blue gray wash no text",
      2051,
    ),
  },
  10: {
    alt: "A small golden thread leaving a phone and joining a world map",
    url: storyArtUrl(
      "premium pencil sketch on warm paper small golden thread flowing from a phone screen into a subtle hand drawn world map made of human lights warm hopeful no text",
      2052,
    ),
  },
  14: {
    alt: "An elderly woman at a kitchen table remembering names",
    url: storyArtUrl(
      "premium pencil sketch on warm paper elderly woman sitting at a kitchen table with old photographs and a cup of tea remembering names warm lamp emotional global human story no text",
      2053,
    ),
  },
  18: {
    alt: "A young nurse on a train reading answers on her phone at dawn",
    url: storyArtUrl(
      "premium pencil sketch on warm paper young nurse on early morning train reading a phone screen soft dawn city window global human story subtle blue gray shading no text",
      2043,
    ),
  },
  27: {
    alt: "A repair shop counter with a notebook, radio parts, and an unanswered phone",
    url: storyArtUrl(
      "premium pencil sketch on warm paper small repair shop counter with open radio parts notebook pencil and unanswered phone warm rain outside emotional father story detailed graphite no text",
      2054,
    ),
  },
  34: {
    alt: "A fisherman repairing a net beside cold water at sunrise",
    url: storyArtUrl(
      "premium pencil sketch on warm paper older fisherman repairing a net beside cold water at sunrise quiet hands human dignity global story delicate graphite no text",
      2044,
    ),
  },
  43: {
    alt: "A private anonymous question floating above a city at night",
    url: storyArtUrl(
      "premium pencil sketch on warm paper anonymous verified human question represented as a soft glowing blank card above a rainy city at night private emotional subtle gold accent no readable text",
      2055,
    ),
  },
  51: {
    alt: "A small apartment table with phones, tea, and handwritten notes from different languages",
    url: storyArtUrl(
      "premium pencil sketch on warm paper small apartment table with phones tea handwritten notes in many languages warm lamp global human connection delicate graphite no readable text",
      2045,
    ),
  },
  64: {
    alt: "A caregiver placing an old ocean photograph beside a bed",
    url: storyArtUrl(
      "premium pencil sketch on warm paper caregiver placing an old ocean photograph beside an elderly parent's bed soft evening light memory tenderness no text",
      2056,
    ),
  },
  72: {
    alt: "A global wall of small portraits and voice waves glowing softly",
    url: storyArtUrl(
      "premium pencil sketch on warm paper futuristic installation wall of small human portraits and voice waveforms glowing softly museum of humanity graphite with subtle gold accents no text",
      2046,
    ),
  },
  81: {
    alt: "Two distant countries represented by windows lit in cold and warm cities",
    url: storyArtUrl(
      "premium pencil sketch on warm paper two distant cities one cold quiet one warm crowded connected by subtle golden thread lit apartment windows loneliness room no text",
      2057,
    ),
  },
  93: {
    alt: "People in different countries looking at the same sunrise through windows",
    url: storyArtUrl(
      "premium pencil sketch on warm paper split scene people in different countries looking at the same sunrise through windows warm human hope global graphite line art no text",
      2047,
    ),
  },
  106: {
    alt: "A future technology question represented by humans around a soft transparent screen",
    url: storyArtUrl(
      "premium pencil sketch on warm paper diverse humans standing around a soft transparent screen discussing future technology warm ethical human mood graphite and subtle gold no readable text",
      2058,
    ),
  },
  118: {
    alt: "A quiet futuristic public square where strangers read human messages",
    url: storyArtUrl(
      "premium pencil sketch on warm paper near future public square at dusk diverse strangers reading soft glowing human messages on transparent screens calm premium no text",
      2048,
    ),
  },
  129: {
    alt: "A phone with one percent battery glowing in a dark hospital room",
    url: storyArtUrl(
      "premium pencil sketch on warm paper phone with very low battery glowing beside a hospital bed in dark room generator light emotional quiet no readable text",
      2059,
    ),
  },
  142: {
    alt: "A beautiful realistic global chain of light crossing oceans and cities",
    url: storyArtUrl(
      "premium pencil sketch on warm paper earth from high altitude with subtle warm threads of light crossing oceans and cities human chain hopeful graphite with gold accent no text",
      2049,
    ),
  },
};

function storyArtUrl(prompt: string, seed: number) {
  const artDirection =
    "consistent editorial illustration style, pencil art on textured ivory paper, hand drawn graphite, soft shading, premium monthly magazine, no watermark, no text";
  const encodedPrompt = encodeURIComponent(`${prompt}, ${artDirection}`);

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=900&seed=${seed}&nologo=true`;
}

const globalStoryChapters = [
  [
    "MONTHLY HUMAN STORY: The Question That Crossed The World. This month's chain begins with one question sent to verified humans everywhere: What are you carrying that no one can see?",
    "Mila in Manila keeps a train ticket in her pocket because it reminds her she once chose movement over fear. Tomas in Lisbon counts rent money twice. Asha in Mumbai washes ink from her fingers. Kenji in Tokyo sits beside his sleeping father.",
    "They do not know one another. They are four ordinary humans carrying private weather through public streets, smiling when work requires it, answering messages with fewer truths than they feel.",
    "The HumanChain prompt travels quietly through phones in buses, kitchens, hospitals, markets, offices, and bedrooms where people are trying not to fall apart.",
    "Mila almost skips it. Patients are waiting, her mother needs money, and her body has learned to call exhaustion normal. Still, the question stays under her thumb like a pulse.",
    "Tomas reads it behind the counter of his repair shop. A broken radio lies open in front of him, wires exposed like a confession. Near the register, a photo of his son curls at the edge.",
    "Asha reads it in a stairwell because the design studio has no quiet room. She is twenty-seven, ambitious, and afraid ambition is slowly replacing her softness.",
    "Kenji reads it at 2:13 a.m. His father is asleep, the apartment smells faintly of medicine, and the city outside looks too clean to admit anyone inside it needs help.",
    "Human message: everyone is carrying something. The first kindness is remembering that the visible person is never the whole person.",
    "Mila types first: I am carrying everyone else's emergencies and pretending I have none of my own. She stares at the sentence until honesty becomes heavier than shame.",
  ],
  [
    "She presses send. A thin golden thread joins her words to the living map.",
    "In Lisbon, Tomas answers with a photograph of his hands. They are rough from screws, solder, and years of fixing objects while his own life waits in pieces.",
    "He writes: I am carrying a silence between me and my son. I do not know how to repair it because it does not have parts I can order.",
    "Asha does not post yet. She reads. A farmer in Peru is carrying rain that will not come. A student in Cairo is carrying the pressure to become the family's proof.",
    "A grandmother in Warsaw writes that she is carrying the names of people who no longer have anyone to say them. Her answer receives no dramatic words, only many quiet saves.",
    "Kenji records a voice note instead of typing. He says: I am carrying my father's fear and my own resentment about being needed.",
    "He almost deletes the resentment part. Then he imagines thousands of humans deleting the real sentence and sending the acceptable one.",
    "The app translates his voice into languages he cannot read. His truth becomes available without becoming less his.",
    "Mila hears the voice note on her break. She sits beside a vending machine and thinks of her own mother, who loves through requests because requests are the language survival taught her.",
    "Human message: honesty does not need to be perfect to be useful. Sometimes the sentence you almost delete is the one another human needs.",
  ],
  [
    "Mila taps I felt this. It is a small action, but Kenji sees it thirty seconds later in Tokyo and breathes differently.",
    "By evening, the question has reached ninety-one countries. Human Pulse shows stress, hope, grief, ambition, and love moving like weather across the map.",
    "Asha finally answers: I am carrying the fear that if I slow down, I will discover I am not special.",
    "The sentence embarrasses her because it sounds vain until she sees how many people save it.",
    "A dancer in Brazil replies: wanting to matter is not vanity. It is a human asking not to vanish.",
    "A shopkeeper in Morocco replies: special is not the opposite of ordinary. Sometimes ordinary done with care becomes special after many days.",
    "Asha places her phone face down. The stairwell is still ugly. Her lunch is still cold. But the world has complicated her shame, and that is a beginning.",
    "Tomas pays 1 WLD to tip the grandmother in Warsaw. He does not know why that answer touched him, only that names deserve witnesses.",
    "Her reply arrives an hour later: Mateusz. He loved apricots. Tomas reads it twice and imagines a person built from one fruit and one name.",
    "Human message: pain should not be ranked. It should be shaped carefully enough that someone can carry it with less loneliness.",
  ],
  [
    "The Human Verdict begins forming: people are carrying duty, regret, money fear, loneliness, family expectations, grief, and the strange pressure to appear grateful while tired.",
    "The next day's chain asks: What helps you continue when advice is not enough? This is the kind of question people answer more slowly.",
    "Mila writes: a clean uniform, even when my life feels unwashed. A nurse in Canada replies with a photo of polished shoes.",
    "A doctor in Thailand sends a voice note about washing his cup after every shift. The ritual is small, but it gives the day a border.",
    "Tomas writes: fixing one small thing completely. He repairs the broken radio and plays music through it before calling the customer.",
    "Asha writes: walking without headphones so my own thoughts stop feeling like strangers. She takes a longer route home and notices a tree growing out of a cracked wall.",
    "Kenji writes: making soup badly, then making it again. The answer becomes unexpectedly popular because humans trust imperfect rituals.",
    "A teenager in Nairobi writes: I continue when someone older admits they are also confused. The sentence travels far.",
    "A retired teacher in Seoul answers: I am older, and I am also confused. Please continue anyway.",
    "Human message: when advice is too big, rituals can be small bridges back to yourself.",
  ],
  [
    "Someone asks the world whether hope is a feeling or a practice. The verdict says practice, by 67%.",
    "Mila saves that verdict and renames it: For days when feelings cannot be trusted.",
    "On the third day, Tomas uses 4 WLD to ask privately: How do you apologize to a child who became an adult while you were absent?",
    "The app marks the question anonymous but verified. This matters to him. Shame wants a mask, but trust requires a real human behind it.",
    "Answers arrive from parents, sons, daughters, guardians, teachers, and people who still wait for apologies they know may never come.",
    "A woman in Mexico writes: do not explain first. Let the wound speak before you defend the knife.",
    "A man in Indonesia writes: apology is not a speech. It is a schedule you keep after the speech.",
    "A daughter in France writes: say exactly what you did. General regret makes the hurt person do the accounting.",
    "Tomas copies three answers into a notebook. His handwriting looks younger when he is afraid.",
    "Human message: repair begins when you stop asking your guilt to be forgiven before the hurt is heard.",
  ],
  [
    "The Deep Human Verdict says: begin with ownership, ask what repair would mean, accept that forgiveness is not owed, and return consistently without demanding warmth.",
    "Tomas closes the shop early. The city smells of rain and bread. He calls his son and says the first specific sentence.",
    "The call lasts six minutes. It is not enough. It is not nothing.",
    "Asha enters the Human Story section that weekend. The monthly story is not about one hero but many strangers connected by one question.",
    "She finds herself inside it before she understands the shape. The pages move between Manila, Lisbon, Mumbai, Tokyo, and dozens of small human rooms in between.",
    "On page 51, an image shows a table with phones, tea, and notes in many languages. Asha pauses there longer than the story requires.",
    "The app does not pretend global means identical. People answer from different economies, religions, fears, jokes, family systems, and definitions of respect.",
    "A farmer in Kenya says dignity is being paid on time. A musician in Argentina says dignity is making art without begging to be understood.",
    "A mother in Turkey says dignity is closing the bathroom door for five minutes and not being followed. It becomes one of the most saved lines in the story.",
    "Human message: being useful is beautiful; being used is different. Learn the difference before your body has to teach you.",
  ],
  [
    "Asha pays 2 WLD to unlock reader reflections. The best one comes from a mechanic in Romania: we are not asking the world to carry us, only to stop pretending we weigh nothing.",
    "That sentence follows her into Monday. She writes it on a sticky note and puts it inside her laptop where no manager can see.",
    "Work feels different when she stops confusing being useful with being used.",
    "Kenji's father wakes one morning asking for the sea. They live nowhere near it. The request is medically ordinary and emotionally impossible.",
    "Kenji opens Ask The World: What do you do when someone you love asks for a place you cannot give them?",
    "He selects Voice Answers because he does not want polished advice. He wants the hesitation inside people's voices.",
    "A woman from Greece says she once brought a bowl of salt water to her grandmother and let her smell it.",
    "A caregiver in Ghana says: sometimes the place is not geography. Ask what the sea remembers for him.",
    "Kenji asks. His father says: your mother wore a blue dress there. Then he sleeps again.",
    "Human message: impossible requests are sometimes memories knocking. Answer the memory, not only the words.",
  ],
  [
    "Kenji finds an old photograph, blue dress faded almost gray, and places it by the bed. His father touches the corner with two fingers.",
    "Kenji posts a link: today I learned that love sometimes arrives disguised as an impossible request.",
    "The world saves it carefully.",
    "Mila's hospital begins a week of shortages. Everyone becomes efficient in the way people become when there is not enough of anything except need.",
    "She stops opening HumanChain for two days, then feels oddly lonely for people she has never met.",
    "When she returns, her streak has ended. The app offers a 1 WLD restore. She almost presses it, then decides the broken streak tells the truth.",
    "She posts: I disappeared for two days because real life was louder than my rituals.",
    "A teacher in New Zealand replies: a streak should remind you to live, not punish you for living.",
    "Mila answers three questions that night: burnout, sending money home, and whether kindness can survive exhaustion.",
    "Human message: if a ritual becomes a punishment, soften it. The point is return, not perfection.",
  ],
  [
    "For the kindness question, Mila writes: kindness survives when it becomes smaller. A cup of water. A closed door. A message saying I cannot talk but I care.",
    "Her answer receives tips from five countries. She uses none of them dramatically. She buys breakfast.",
    "Breakfast can be a form of hope when your body has been treated like a tool.",
    "HumanChain's World Map shows a strange pairing that Thursday: Finland and Brazil are both active in the Loneliness Room.",
    "People compare winter silence and crowded loneliness. One writes: my city is loud enough to hide in. Another writes: my town is quiet enough to hear myself disappear.",
    "The app creates a verdict: loneliness is not the absence of people; it is the absence of being known accurately.",
    "Asha sends that verdict to a friend she has been avoiding. The friend replies with one word: yes.",
    "That yes becomes a two-hour conversation. Not every chain stays inside the app. The best ones escape into life.",
    "Tomas's son does not answer for four days. On the fifth, he sends a photo of a broken lamp and writes: can this be fixed?",
    "Human message: when someone asks about the lamp, listen for the relationship hiding behind the object.",
  ],
  [
    "Tomas understands the question is not only about the lamp. He replies: yes, if I can see what is broken.",
    "His son comes Saturday. They talk mostly about screws, electricity, and lunch. Repair often enters through side doors.",
    "Tomas does not ask for forgiveness. He asks if his son wants more rice.",
    "It is the first good question he has asked in years.",
    "At page 93 of the monthly story, the image shows different people watching the same sunrise from separate windows.",
    "Mila sees it near dawn. Asha sees it at lunch. Kenji sees it after dinner. Tomas sees it while the repaired lamp cools on the counter.",
    "They are not friends. They are not a group chat. They are part of a pattern that makes loneliness less convincing.",
    "The story asks: What is one thing a stranger taught you this month?",
    "Mila writes: rest is not a reward for finishing all need. Need does not finish.",
    "Human message: the world becomes less abstract when a stranger teaches you one sentence you can actually use.",
  ],
  [
    "Tomas writes: an apology is a calendar. Asha writes: ordinary care repeated long enough becomes a life.",
    "Kenji writes: impossible requests may be memories knocking.",
    "Thousands of answers gather under theirs. Some are plain. Some are beautiful. Some are poorly translated and still unmistakably human.",
    "The app does not flatten the world. It lets difference become readable.",
    "A sponsored chain appears: What should future technology protect about humans? The question could become marketing. Instead, the answers become unexpectedly tender.",
    "A farmer says technology should protect patience. A musician says mistakes. A child says grandparents' stories.",
    "A programmer says the right to be unreachable.",
    "Asha answers: protect the part of us that changes our mind after hearing someone else's pain.",
    "Kenji answers: protect memory from becoming only data.",
    "Human message: technology is most human when it protects the parts of us that cannot be optimized without being harmed.",
  ],
  [
    "Mila answers: protect tired people from systems that call exhaustion dedication. Tomas answers: protect repair. New is not always better than mended.",
    "The verdict says future tools should protect dignity, attention, privacy, slowness, language, grief, and the right to be more than productive.",
    "That verdict becomes the most shared page of the month. People do not share it because it is perfect. They share it because it sounds like something humans should decide before they forget to decide.",
    "Near the end of the month, a storm cuts power in Mila's neighborhood. Her phone has 19%. The hospital generator hums like an old promise.",
    "She opens HumanChain once, not to post, only to read. The Daily Chain asks: What light stayed on for you?",
    "A man in Pakistan writes: my daughter's joke. A woman in Norway writes: the neighbor who shoveled my door without telling me.",
    "A student in Lagos writes: a stranger's answer that made me eat dinner.",
    "Mila writes: the light stayed on in people who had no reason to answer me and answered anyway.",
    "Her battery dies before she sees the reactions.",
    "Human message: some help is quiet. Quiet help still counts.",
  ],
  [
    "The next morning, the post has been saved 4,012 times. Not viral in the loud way. Useful in the quiet way.",
    "One user tips 6 WLD with a note: this helped me not send a message I could not unsend.",
    "Mila sits on the edge of a hospital bed and lets the world be heavy and kind at once.",
    "The final Human Verdict for the story is not a command. It is a mirror assembled from many rooms.",
    "It says: being human is carrying what others cannot see, and still becoming visible enough to be helped, corrected, witnessed, and changed.",
    "It says people do not always need answers first. Sometimes they need accurate company.",
    "It says money matters, family matters, health matters, dignity matters, but none of them can replace the sentence that arrives at the right hour.",
    "It says technology becomes human when it increases our ability to notice one another without owning one another.",
    "Asha saves the verdict. Tomas places it near the register. Kenji translates one line for his father. Mila sends it to herself because some messages need to wait for a future version of us.",
    "Human message: the right sentence does not solve your life. It gives your life a better next step.",
  ],
  [
    "The story asks readers to add one link before leaving.",
    "The links come from islands, megacities, villages, suburbs, dorm rooms, shelters, airports, offices, temples, hospitals, kitchens, and sidewalks where people stop walking for ten seconds.",
    "I am scared, but I am reachable. I am proud, but I can apologize. I am tired, but I can be gentle. I am lost, but I can ask better questions.",
    "The chain becomes a global room with no ceiling.",
    "On the last night, HumanChain shows Earth threaded with warm light. It is beautiful, but the beauty matters less than the small actions beneath it.",
    "A nurse drinks water. A repairman makes a call. A designer takes a walk without headphones. A son places an old photograph beside a bed.",
    "None of these actions will trend outside the people they touch. Still, the world is mostly held together by things too small to headline.",
    "Final monthly question: What will you do with the link you were given?",
    "Mila chooses sleep. Tomas chooses Saturday lunch. Asha chooses one honest boundary. Kenji chooses to ask his father about the blue dress while there is still time.",
    "Human message: a story becomes real when it changes what someone does after closing it.",
  ],
  [
    "Reader page: If this story found you at the right hour, add your own link to the chain.",
    "Write one thing you are carrying, one thing that helped, or one sentence another human may need today.",
    "You can answer privately, publicly, or with voice. You can simply save the story if that is all you have energy for.",
    "The world does not need your perfect version to receive your real one.",
    "This month's Human Verdict: people heal more honestly when advice, witness, and action meet in the same place.",
    "Most repeated truth: I thought I was the only one.",
    "Most saved answer: rest is not a reward for finishing all need.",
    "Most tipped link: the light stayed on in people who had no reason to answer me and answered anyway.",
    "What are you carrying that no one can see?",
    "Add your link.",
  ],
];

const storyBeats = globalStoryChapters.flat();

const storyPages = storyBeats.map((text, index) => {
  const image = storyImageByPage[index + 1] ?? null;

  return {
    page: index + 1,
    text,
    image,
  };
});

const wldActions = [
  ["1 WLD", "Tip, Golden Link, or streak restore"],
  ["2 WLD", "Pin a link or unlock story pages"],
  ["3 WLD", "Ask one country or save a capsule"],
  ["4 WLD", "Ask privately as a verified human"],
  ["5 WLD", "Request voice answers"],
  ["6 WLD", "Unlock Deep Human Verdict"],
];

type Tab = "home" | "ask" | "chains" | "stories" | "me";

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
            <img alt={current.image.alt} src={current.image.url} />
          ) : null}
          <span className="section-kicker">The Question That Crossed The World</span>
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
        <span>April Human Story</span>
        <h2>The Question That Crossed The World</h2>
        <p>
          A monthly global story about invisible burdens, verified human
          answers, and the strangers who help us become visible again.
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
          "The invisible question",
          "Four strangers",
          "The world answers",
          "A verdict forms",
        ].map((chapter, index) => (
          <article
            key={chapter}
            onClick={() => {
              setPage(index * 25);
              setIsReading(true);
            }}
          >
            <span>Chapter {index + 1}</span>
            <h3>{chapter}</h3>
          </article>
        ))}
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
