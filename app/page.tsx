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
    url: "https://image.pollinations.ai/prompt/realistic%20cinematic%20documentary%20photo%20close%20up%20of%20human%20hands%20from%20different%20backgrounds%20holding%20small%20meaningful%20objects%20coins%20photo%20ticket%20key%20soft%20morning%20light%20global%20human%20story%20no%20text?width=1200&height=900&seed=2041&nologo=true",
  },
  2: {
    alt: "Futuristic realistic global map of glowing human threads across cities",
    url: "https://image.pollinations.ai/prompt/realistic%20futuristic%20global%20human%20network%20seen%20from%20above%20warm%20gold%20threads%20connecting%20cities%20and%20people%20holding%20phones%20premium%20cinematic%20human%20technology%20no%20text?width=1200&height=900&seed=2042&nologo=true",
  },
  18: {
    alt: "A young nurse on a train reading answers on her phone at dawn",
    url: "https://image.pollinations.ai/prompt/realistic%20cinematic%20photo%20young%20nurse%20on%20early%20morning%20train%20reading%20a%20phone%20screen%20soft%20blue%20dawn%20city%20window%20global%20human%20story%20no%20text?width=1200&height=900&seed=2043&nologo=true",
  },
  34: {
    alt: "A fisherman repairing a net beside cold water at sunrise",
    url: "https://image.pollinations.ai/prompt/realistic%20cinematic%20photo%20older%20fisherman%20repairing%20a%20net%20beside%20cold%20water%20at%20sunrise%20quiet%20hands%20human%20dignity%20global%20story%20no%20text?width=1200&height=900&seed=2044&nologo=true",
  },
  51: {
    alt: "A small apartment table with phones, tea, and handwritten notes from different languages",
    url: "https://image.pollinations.ai/prompt/realistic%20cinematic%20photo%20small%20apartment%20table%20with%20phones%20tea%20handwritten%20notes%20in%20many%20languages%20warm%20lamp%20global%20human%20connection%20no%20text?width=1200&height=900&seed=2045&nologo=true",
  },
  72: {
    alt: "A global wall of small portraits and voice waves glowing softly",
    url: "https://image.pollinations.ai/prompt/realistic%20futuristic%20installation%20wall%20of%20small%20human%20portraits%20and%20voice%20waveforms%20glowing%20softly%20museum%20of%20humanity%20premium%20warm%20no%20text?width=1200&height=900&seed=2046&nologo=true",
  },
  93: {
    alt: "People in different countries looking at the same sunrise through windows",
    url: "https://image.pollinations.ai/prompt/realistic%20cinematic%20split%20scene%20people%20in%20different%20countries%20looking%20at%20the%20same%20sunrise%20through%20windows%20warm%20human%20hope%20global%20no%20text?width=1200&height=900&seed=2047&nologo=true",
  },
  118: {
    alt: "A quiet futuristic public square where strangers read human messages",
    url: "https://image.pollinations.ai/prompt/realistic%20near%20future%20public%20square%20at%20dusk%20diverse%20strangers%20reading%20soft%20glowing%20human%20messages%20on%20transparent%20screens%20calm%20premium%20no%20text?width=1200&height=900&seed=2048&nologo=true",
  },
  142: {
    alt: "A beautiful realistic global chain of light crossing oceans and cities",
    url: "https://image.pollinations.ai/prompt/realistic%20cinematic%20earth%20from%20high%20altitude%20with%20subtle%20warm%20threads%20of%20light%20crossing%20oceans%20and%20cities%20human%20chain%20hopeful%20premium%20no%20text?width=1200&height=900&seed=2049&nologo=true",
  },
};

const globalStoryChapters = [
  [
    "Mila in Manila kept a train ticket in her pocket because it reminded her she had once chosen movement over fear. On the same morning, Tomas in Lisbon counted rent money twice, Asha in Mumbai washed ink from her fingers, and Kenji in Tokyo sat beside his sleeping father.",
    "None of them knew the others existed. They were four ordinary humans carrying private weather through public streets, smiling when work required it, answering messages with fewer truths than they felt.",
    "HumanChain opened that day with one question: What are you carrying that no one can see? The prompt moved quietly through phones in buses, kitchens, hospitals, markets, offices, and bedrooms where people were trying not to fall apart.",
    "Mila almost skipped it. She had patients waiting, a mother asking for money, and a body that had learned to call exhaustion normal. Still, the question stayed under her thumb like a pulse.",
    "Tomas read it behind the counter of his small repair shop. A broken radio sat open in front of him, wires exposed like a confession. He whispered the question once and looked at the photo of his son taped near the register.",
    "Asha saw it during lunch, sitting on a stairwell because the design studio had no quiet room. She was twenty-seven, ambitious, and afraid that ambition was slowly replacing her softness.",
    "Kenji saw it at 2:13 a.m. His father was asleep, the apartment smelled faintly of medicine, and the city outside looked expensive, clean, and impossible to ask for help inside.",
    "The world kept moving. Doors opened. Engines coughed. Notifications arrived. Somewhere, a child laughed with a full-body joy that made strangers turn their heads.",
    "Mila typed first: I am carrying everyone else's emergencies and pretending I have none of my own. She stared at the sentence until honesty became heavier than shame.",
    "She pressed send. A thin thread joined her words to the living map.",
  ],
  [
    "In Lisbon, Tomas answered with a photograph of his hands. The hands were rough from screws, solder, and years of fixing objects while his own life waited in pieces.",
    "He wrote: I am carrying a silence between me and my son. I do not know how to repair it because it does not have parts I can order.",
    "Asha did not post yet. She read. A farmer in Peru said he was carrying rain that would not come. A student in Cairo said she was carrying the pressure to become the family's proof.",
    "A grandmother in Warsaw wrote that she was carrying the names of people who no longer had anyone to say them. Her answer received no dramatic words, only many quiet saves.",
    "Kenji recorded a voice note instead of typing. In it, he said: I am carrying my father's fear and my own resentment about being needed.",
    "He almost deleted the resentment part. Then he imagined thousands of humans deleting the real sentence and sending the acceptable one.",
    "The app translated his voice into languages he could not read. His truth became available without becoming less his.",
    "Mila heard the voice note on her break. She sat beside a vending machine and thought of her own mother, who loved her through requests because requests were the language survival had taught her.",
    "She tapped I felt this. It was a small action, but Kenji saw it thirty seconds later in Tokyo and breathed differently.",
    "HumanChain did not fix anything. It made the invisible visible enough to be held.",
  ],
  [
    "By evening, the question had reached ninety-one countries. The Human Pulse showed stress, hope, grief, ambition, and love moving like weather systems across the map.",
    "Asha finally answered: I am carrying the fear that if I slow down, I will discover I am not special. The sentence embarrassed her because it sounded vain until she saw how many people saved it.",
    "A dancer in Brazil replied: wanting to matter is not vanity. It is a human asking not to vanish.",
    "A shopkeeper in Morocco replied: special is not the opposite of ordinary. Sometimes ordinary done with care becomes special after many days.",
    "Asha placed her phone face down. The stairwell was still ugly. Her lunch was still cold. But the world had complicated her shame, and that was a beginning.",
    "Tomas paid 1 WLD to tip the grandmother in Warsaw. He did not know why that answer had touched him, only that names deserved witnesses.",
    "The app asked if he wanted to add a note. He wrote: Please say one name today for me too.",
    "Her reply came an hour later: Mateusz. He loved apricots. Tomas read it twice and imagined a person built from one fruit and one name.",
    "The Human Verdict began forming: people were carrying duty, regret, money fear, loneliness, family expectations, grief, and the strange pressure to appear grateful while tired.",
    "The verdict did not rank pain. It gave shape to it.",
  ],
  [
    "The next day's chain asked: What helps you continue when advice is not enough? This was the kind of question people answered more slowly.",
    "Mila wrote: a clean uniform, even when my life feels unwashed. A nurse in Canada replied with a photo of polished shoes. A doctor in Thailand sent a voice note about washing his cup after every shift.",
    "Tomas wrote: fixing one small thing completely. He repaired the broken radio and played music through it before calling the customer. The song sounded older than apology.",
    "Asha wrote: walking without headphones so my own thoughts stop feeling like strangers. She took a longer route home and noticed a tree growing out of a cracked wall.",
    "Kenji wrote: making soup badly, then making it again. The answer became unexpectedly popular because humans trust imperfect rituals.",
    "A teenager in Nairobi wrote: I continue when someone older admits they are also confused. The sentence traveled far.",
    "A retired teacher in Seoul answered: I am older, and I am also confused. Please continue anyway.",
    "HumanChain's thread did not become inspirational in a clean way. It became useful in a human way: specific, contradictory, sometimes funny, sometimes too honest to decorate.",
    "Someone asked the world whether hope was a feeling or a practice. The verdict said practice, by 67%.",
    "Mila saved that verdict and renamed it: For days when feelings cannot be trusted.",
  ],
  [
    "On the third day, Tomas used 4 WLD to ask privately: How do you apologize to a child who became an adult while you were absent?",
    "The app marked the question anonymous but verified. This mattered to him. Shame wanted a mask, but trust required a real human behind it.",
    "Answers arrived from parents, sons, daughters, guardians, teachers, and people who still waited for apologies they knew might never come.",
    "A woman in Mexico wrote: do not explain first. Let the wound speak before you defend the knife.",
    "A man in Indonesia wrote: apology is not a speech. It is a schedule you keep after the speech.",
    "A daughter in France wrote: say exactly what you did. General regret makes the hurt person do the accounting.",
    "Tomas copied three answers into a notebook. His handwriting looked younger when he was afraid.",
    "The Deep Human Verdict said: begin with ownership, ask what repair would mean, accept that forgiveness is not owed, and return consistently without demanding warmth.",
    "He closed the shop early. The city smelled of rain and bread. He called his son and said the first specific sentence.",
    "The call lasted six minutes. It was not enough. It was not nothing.",
  ],
  [
    "Asha entered the Human Story section that weekend. The monthly story was not about one hero but four strangers connected by a question.",
    "She found herself inside it before she understood the shape. The pages moved between Manila, Lisbon, Mumbai, Tokyo, and dozens of small human rooms in between.",
    "On page 51, there was an image of a table with phones, tea, and notes in many languages. Asha paused there longer than the story required.",
    "She liked that the app did not pretend global meant identical. People answered from different economies, religions, fears, jokes, family systems, and definitions of respect.",
    "A farmer in Kenya said dignity was being paid on time. A musician in Argentina said dignity was making art without begging to be understood.",
    "A mother in Turkey said dignity was closing the bathroom door for five minutes and not being followed. That answer became one of the most saved lines in the story.",
    "Asha laughed, then felt guilty, then saved it. The app allowed mixed reactions because humans are rarely one emotion at a time.",
    "She paid 2 WLD to unlock reader reflections. The best one came from a mechanic in Romania: we are not asking the world to carry us, only to stop pretending we weigh nothing.",
    "That sentence followed her into Monday. She wrote it on a sticky note and put it inside her laptop where no manager could see.",
    "Work felt different when she stopped confusing being useful with being used.",
  ],
  [
    "Kenji's father woke one morning asking for the sea. They lived nowhere near it. The request was medically ordinary and emotionally impossible.",
    "Kenji opened Ask The World: What do you do when someone you love asks for a place you cannot give them?",
    "He selected Voice Answers because he did not want polished advice. He wanted the hesitation inside people's voices.",
    "A woman from Greece said she once brought a bowl of salt water to her grandmother and let her smell it. A man from Chile played recordings of waves beside his brother's bed.",
    "A caregiver in Ghana said: sometimes the place is not geography. Ask what the sea remembers for him.",
    "Kenji asked. His father said: your mother wore a blue dress there. Then he slept again.",
    "The answer changed the request. It was not about transport. It was about memory asking for a door.",
    "Kenji found an old photograph, blue dress faded almost gray, and placed it by the bed. His father touched the corner with two fingers.",
    "Kenji posted a link: today I learned that love sometimes arrives disguised as an impossible request.",
    "The world saved it carefully.",
  ],
  [
    "Mila's hospital began a week of shortages. Everyone became efficient in the way people become when there is not enough of anything except need.",
    "She stopped opening HumanChain for two days, then felt oddly lonely for people she had never met.",
    "When she returned, her streak had ended. The app offered a 1 WLD restore. She almost pressed it, then decided the broken streak told the truth.",
    "She posted: I disappeared for two days because real life was louder than my rituals.",
    "A teacher in New Zealand replied: a streak should remind you to live, not punish you for living.",
    "The HumanChain team had written nothing that wise into the interface. The users kept improving the product from inside it.",
    "Mila answered three questions that night. One about burnout, one about sending money home, one about whether kindness can survive exhaustion.",
    "For the kindness question, she wrote: kindness survives when it becomes smaller. A cup of water. A closed door. A message saying I cannot talk but I care.",
    "Her answer received tips from five countries. She used none of them dramatically. She bought breakfast.",
    "Breakfast can be a form of hope when your body has been treated like a tool.",
  ],
  [
    "HumanChain's World Map showed a strange pairing that Thursday: Finland and Brazil were both active in the Loneliness Room.",
    "People compared winter silence and crowded loneliness. One person wrote: my city is loud enough to hide in. Another wrote: my town is quiet enough to hear myself disappear.",
    "The app created a Human Verdict from the room: loneliness is not the absence of people; it is the absence of being known accurately.",
    "Asha sent that verdict to a friend she had been avoiding. The friend replied with one word: yes.",
    "That yes became a two-hour conversation. Not every chain stayed inside the app. The best ones escaped into life.",
    "Tomas's son did not answer for four days. On the fifth, he sent a photo of a broken lamp and wrote: can this be fixed?",
    "Tomas understood the question was not only about the lamp. He replied: yes, if I can see what is broken.",
    "The son came Saturday. They talked mostly about screws, electricity, and lunch. Repair often enters through side doors.",
    "Tomas did not ask for forgiveness. He asked if his son wanted more rice.",
    "It was the first good question he had asked in years.",
  ],
  [
    "At page 93 of the monthly story, the image showed different people watching the same sunrise from separate windows.",
    "Mila saw it in Manila near dawn. Asha saw it in Mumbai at lunch. Kenji saw it in Tokyo after dinner. Tomas saw it in Lisbon while the repaired lamp cooled on the counter.",
    "They were not friends. They were not a group chat. They were part of a pattern that made loneliness less convincing.",
    "The story asked: What is one thing a stranger taught you this month?",
    "Mila wrote: that rest is not a reward for finishing all need. Need does not finish.",
    "Tomas wrote: that an apology is a calendar.",
    "Asha wrote: that ordinary care repeated long enough becomes a life.",
    "Kenji wrote: that impossible requests may be memories knocking.",
    "Thousands of answers gathered under theirs. Some were plain. Some were beautiful. Some were poorly translated and still unmistakably human.",
    "The app did not flatten the world. It let difference become readable.",
  ],
  [
    "A sponsored chain appeared: What should future technology protect about humans? The question could have become marketing. Instead, the answers became unexpectedly tender.",
    "A farmer said technology should protect patience. A musician said mistakes. A child said grandparents' stories. A programmer said the right to be unreachable.",
    "Asha answered: protect the part of us that changes our mind after hearing someone else's pain.",
    "Kenji answered: protect memory from becoming only data.",
    "Mila answered: protect tired people from systems that call exhaustion dedication.",
    "Tomas answered: protect repair. New is not always better than mended.",
    "The Human Verdict said future tools should protect dignity, attention, privacy, slowness, language, grief, and the right to be more than productive.",
    "That verdict became the most shared page of the month.",
    "People did not share it because it was perfect. They shared it because it sounded like something humans should decide before they forgot to decide.",
    "HumanChain felt largest when it made the world pause.",
  ],
  [
    "Near the end of the month, a storm cut power in Mila's neighborhood. Her phone had 19%. The hospital generator hummed like an old promise.",
    "She opened HumanChain once, not to post, only to read. The Daily Chain asked: What light stayed on for you?",
    "A man in Pakistan wrote: my daughter's joke. A woman in Norway wrote: the neighbor who shoveled my door without telling me.",
    "A student in Lagos wrote: a stranger's answer that made me eat dinner. A grandmother in Peru wrote: the lamp my husband fixed before he died.",
    "Mila thought of Tomas without knowing his name. Somewhere, someone knew how to fix lamps and maybe fathers.",
    "She wrote: the light stayed on in people who had no reason to answer me and answered anyway.",
    "Her battery died before she saw the reactions.",
    "The next morning, the post had been saved 4,012 times. Not viral in the loud way. Useful in the quiet way.",
    "One user tipped 6 WLD with a note: this helped me not send a message I could not unsend.",
    "Mila sat on the edge of a hospital bed and let the world be heavy and kind at once.",
  ],
  [
    "The final Human Verdict for the story was not a command. It was a mirror assembled from many rooms.",
    "It said: being human is carrying what others cannot see, and still becoming visible enough to be helped, corrected, witnessed, and changed.",
    "It said people do not always need answers first. Sometimes they need accurate company.",
    "It said money matters, family matters, health matters, dignity matters, but none of them can replace the sentence that arrives at the right hour.",
    "It said technology becomes human when it increases our ability to notice one another without owning one another.",
    "Asha saved the verdict. Tomas printed it and placed it near the register. Kenji translated one line for his father. Mila sent it to herself because some messages need to wait for a future version of us.",
    "The story asked readers to add one link before leaving.",
    "The links came from islands, megacities, villages, suburbs, dorm rooms, shelters, airports, offices, temples, hospitals, kitchens, and sidewalks where people stopped walking for ten seconds.",
    "I am scared, but I am reachable. I am proud, but I can apologize. I am tired, but I can be gentle. I am lost, but I can ask better questions.",
    "The chain became a global room with no ceiling.",
  ],
  [
    "On the last night, HumanChain showed a high view of Earth threaded with warm light. It was beautiful, but the beauty mattered less than the small actions beneath it.",
    "A nurse drank water. A repairman made a call. A designer took a walk without headphones. A son placed an old photograph beside a bed.",
    "None of these actions would trend outside the people they touched. Still, the world is mostly held together by things too small to headline.",
    "The app asked one final question: What will you do with the link you were given?",
    "Mila chose sleep. Tomas chose Saturday lunch. Asha chose one honest boundary. Kenji chose to ask his father about the blue dress while there was still time.",
    "Other humans chose apologies, applications, medicine, silence, prayer, business plans, leaving, staying, eating, calling, forgiving, refusing, beginning.",
    "The story did not end by solving them. A real human story should not pretend to close what life keeps opening.",
    "It ended with the thread still moving.",
    "Somewhere, a person opened HumanChain for the first time and saw the question waiting.",
    "What are you carrying that no one can see?",
  ],
];

const storyBeats = globalStoryChapters.flat();

const storyPages = Array.from({ length: 150 }, (_, index) => {
  const image = storyImageByPage[index + 1] ?? null;

  return {
    page: index + 1,
    text: storyBeats[index],
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
          detail="150 pages live now"
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
          A 150-page global story about invisible burdens, verified human
          answers, and the strangers who help us become visible again.
        </p>
        <button
          onClick={() => {
            setIsReading(true);
            keepStreak("You opened this month's Human Story.");
          }}
          type="button"
        >
          Read 150 Pages
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
