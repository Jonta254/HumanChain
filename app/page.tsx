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

const storyImages = [
  "https://images.unsplash.com/photo-1494059980473-813e73ee784b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=85",
];

const storyBeats = [
  "Amina counted the coins in her palm and pretended they were enough. Outside, Nairobi was already awake, selling breakfast, calling buses, and asking everyone to be brave before sunrise.",
  "Her mother used to say that being human meant carrying two lives at once: the life people see and the quiet one that waits behind the ribs.",
  "The quiet life had grown loud after the shop closed. Amina had lost her job, her rent was late, and the phone calls from home arrived with the weight of people who needed her to be strong.",
  "She opened World App because she needed to send a small payment, but her thumb stopped on a question inside HumanChain: What does starting again feel like where you are?",
  "A man from Brazil wrote that starting again felt like washing one shirt at night so tomorrow could pretend you owned many. A woman from India wrote that it felt like apologizing to your future self.",
  "Amina did not post at first. She read. Kenya, Japan, Nigeria, Argentina, Germany, Ghana, Indonesia. The world was full of people who looked normal and were secretly rebuilding.",
  "On page one of her own life, she would have written that she was fine. On page two, she would have admitted that fine had become a costume.",
  "That evening she walked home slowly, passing fruit sellers and school children and men arguing about football. The city did not know it had become a witness.",
  "She typed one sentence into the Daily Chain: I am tired, but I have not disappeared. Then she almost deleted it.",
  "Before fear could win, she pressed send. A tiny thread connected her words to the world.",
  "The first reply came from Lagos: I felt this. The second from Manila: stay visible to yourself. The third was a 1 WLD tip from someone in Chile with no message at all.",
  "It was not the money that made her cry. It was the proof that a stranger had paused long enough to say, I see you.",
  "The next morning, HumanChain asked: What can a human build with almost nothing? Amina wanted to laugh. Almost nothing was the only material she had.",
  "She answered a young man's business question with the honesty of someone who had failed recently: Start with trust, not stock. People buy reliability before they buy products.",
  "Her answer was saved by twenty-three humans. One person asked if she had ever run a shop. She stared at the question for a long time.",
  "A shop was not only shelves and receipts. It was rhythm. It was knowing who bought bread before payday and who needed credit without shame.",
  "She remembered the old woman who sold tea near the stage. Every morning, workers lined up because the tea was hot, the cups were clean, and the old woman remembered names.",
  "Amina wrote the idea in her notebook: Morning tea. Clean cups. Names remembered. Small trust, every day.",
  "By noon she had asked the world a question: What small business survives when people have little money?",
  "She used 3 WLD to ask one country first: Kenya. Then she waited like someone listening at a door.",
  "Answers came from Mombasa, Kisumu, Eldoret, Nakuru, Nairobi. Food. Repairs. Hair. Phone charging. Water. Laundry. Tea. The same word returned like a drum: need.",
  "The Human Verdict formed slowly: sell what people need every day, keep quality visible, begin where feet already pass.",
  "Amina saved the verdict into her Human Library. For the first time in weeks, advice had become a map instead of noise.",
  "She borrowed two thermoses from her aunt and bought tea leaves, milk, ginger, sugar, and fifty paper cups. It was not a company. It was a beginning with steam.",
  "At 5:40 the next morning she stood near the bus stage. Her hands shook when the first person asked the price.",
  "By 8:10 she had sold everything. By 8:15 she was calculating what she had done wrong. The cups were too small. The ginger was too light. The sign was invisible.",
  "Failure had changed shape. It was no longer a wall. It was a list.",
  "She posted to HumanChain again: Today I sold tea for the first time. I am embarrassed by how much hope I feel.",
  "A teacher from Ghana replied: hope is not embarrassing. It is evidence.",
  "A student from Japan sent a voice note. The translation said: small work done with care becomes dignity.",
  "By the end of the week, Amina's Human Streak reached seven days. The app called her a Chain Keeper. She laughed, but she liked it.",
  "Her customers began to recognize her. One man wanted less sugar. One woman wanted more ginger. One conductor paid later and actually returned.",
  "Every night Amina answered one HumanChain question before sleeping. Love questions, money questions, family questions. She did not feel wise. She felt useful.",
  "Usefulness became a rope. On hard days, she held it.",
  "A question appeared in the Love Room: How do you forgive yourself for losing time? Amina opened it because the question knew her name without asking.",
  "She read answers for forty minutes. Some were gentle. Some were sharp. One from Morocco said: time is not lost if it teaches you how to return.",
  "Amina wrote: I forgive myself in installments. Today I forgive myself for one month. Tomorrow I will try another.",
  "That answer became Most Honest Link of the day. She took a screenshot and did not send it to anyone. Some victories are too young to explain.",
  "In the second month, she added boiled eggs. In the third, she added mandazi from a neighbor who baked before dawn.",
  "The neighbor's name was Ruth. Ruth had three children, a tired smile, and the kind of humor that arrived exactly when life became heavy.",
  "HumanChain's monthly story that June was about loneliness. Amina read it between customers. Page by page, she realized loneliness was not always the absence of people.",
  "Sometimes loneliness was being surrounded by needs while nobody asked what you needed.",
  "She paid 2 WLD to unlock the bonus pages. She told herself it was business research, but it was really medicine.",
  "The story asked readers to add a reflection. Amina wrote: I used to think help meant rescue. Now I think help can be a sentence arriving at the right hour.",
  "Hundreds of people added their own reflections. The Human Verdict said the world wanted less advice and more witness.",
  "Witness. The word stayed with her.",
  "Amina began asking customers one question each morning: What kind of day are you carrying?",
  "Some people laughed. Some answered with weather. Some told the truth by mistake.",
  "A security guard said he was carrying school fees. A nurse said she was carrying sleep. A student said she was carrying fear of becoming ordinary.",
  "Amina wrote those phrases later in her notebook, not with names, only with respect.",
  "One Friday, rain broke open over the city. People ran under roofs and trees and shopfronts. Amina's tea stayed hot, and the stage became a temporary country.",
  "Someone asked if she had seen the HumanChain prompt: Show the sky above you. Everyone looked up together.",
  "Amina took a photo of the gray sky, the wet road, the waiting buses, and the hands wrapped around paper cups.",
  "She posted it with one line: This is what patience looks like in Nairobi.",
  "The photo traveled further than anything she had written. People from cold cities and desert towns and islands said they knew that sky.",
  "A creator sponsored a chain called Work That Keeps Us Human. Amina almost skipped it because she was busy.",
  "Then Ruth said, Busy is how dreams hide from us. Post.",
  "Amina posted about remembering names. She wrote that a customer becomes less invisible when you know how they take tea.",
  "A cafe owner in Turkey tipped her 5 WLD and wrote: this is hospitality, not marketing.",
  "Marketing. Hospitality. Visibility. Dignity. The world kept giving her better names for things she already understood.",
  "In August, her brother called from home. Their mother was sick again. The old fear returned, fast and familiar.",
  "Amina wanted to vanish into duty. To send money, say nothing, and become a machine that worked until it broke.",
  "Instead she opened Ask The World and typed: How do you care for family without disappearing?",
  "She paid 6 WLD for a Deep Human Verdict. It felt expensive. It also felt necessary.",
  "The answers were not easy. Some said boundaries. Some said prayer. Some said schedules. Some said tell the truth before resentment becomes your language.",
  "The final verdict said: care must include the caregiver, or it becomes a slow form of anger.",
  "Amina read that sentence three times. Then she called her mother and told a smaller, cleaner truth: I can help, but I am also tired.",
  "There was silence. Then her mother said, I know.",
  "Two words can open a locked room.",
  "By September, Amina had a painted wooden stand. Ruth's mandazi sold out by seven. The conductor who used to pay late now brought customers.",
  "HumanChain asked for stories about youth. Amina recorded a voice note: I thought adulthood would feel like arrival. Mostly it feels like negotiating with uncertainty.",
  "The voice note was featured in Voice of Humanity. People heard her actual voice. This frightened her more than writing.",
  "A woman from Argentina replied with her own voice: your uncertainty sounds like mine.",
  "Amina listened twice. The world felt less like a crowd and more like a room with many windows.",
  "Not every day was beautiful. Some mornings sales were low. Some customers were rude. Some relatives treated her progress like a new source of obligation.",
  "When she complained in the Confession Room, someone from the Philippines wrote: growth attracts both support and appetite. Learn the difference.",
  "She saved that into her Human Library under a folder named Survival.",
  "The Human Passport in her profile showed thirty-one countries connected. She had not traveled, but her questions had.",
  "That became another kind of geography.",
  "In October, a developer building a World Mini App asked for advice from small business owners. Amina answered: make people feel seen before you ask them to pay.",
  "He replied: that is the whole product.",
  "Amina smiled because she knew it was also the whole life.",
  "HumanChain's monthly story that October was called The Man Who Forgot His Own Laugh. It was about work, grief, and the strange poverty of never resting.",
  "Amina read all 150 pages over two nights. She tipped the storyteller 1 WLD on page 73.",
  "Page 73 said: nobody claps for the person who chooses peace before collapse, but the body remembers.",
  "She closed the app and slept early for the first time in weeks.",
  "In November, the city changed. Prices rose. People bought less. Hope had to become more practical.",
  "Amina asked the Money Room how to survive a slow season. The answers came with spreadsheets, prayers, jokes, and hard truths.",
  "A shopkeeper from Egypt said: count waste like it is stealing from you, because it is.",
  "A mother from Uganda said: sell one thing for children. Adults deny themselves before they deny children.",
  "Amina added cocoa for school kids. It worked.",
  "HumanChain was becoming less like an app and more like a council she could carry in her pocket.",
  "She still had to choose. The world could answer, but it could not live for her.",
  "That was the hidden respect in Human Verdicts. They gave perspective, not permission.",
  "In December, the Daily Chain asked: What did this year teach you about being human?",
  "Amina watched the thread fill with grief, jokes, miracles, debts, weddings, funerals, babies, migrations, apologies, and small businesses.",
  "She wrote: being human is needing help and still being able to give it.",
  "The sentence became one of the day's Golden Links. Someone pinned it. Someone disagreed. Someone said it helped.",
  "All three reactions felt true.",
  "On the last day of the year, Ruth brought a small cake to the tea stand. It leaned to one side and tasted too sweet.",
  "They ate it from paper plates while buses shouted and rain threatened and the city counted down without ceremony.",
  "Amina opened her Human Mirror. It said her strongest value was courage. She did not agree at first.",
  "Then she read the evidence: 98 answers given, 41 countries connected, 17 saved verdicts, 12 people tipped, 1 story submitted.",
  "One story submitted. She had forgotten that she sent it.",
  "The title was simple: The Day I Started Again.",
  "In January, HumanChain selected it as the monthly Human Story.",
  "Amina saw the notification while pouring tea. Her hands froze. Ruth grabbed the thermos before it spilled.",
  "The cover image was her rainy photo from the bus stage. The first page began with coins in a palm and a city asking everyone to be brave.",
  "She read her own life as if it belonged to someone else, which is sometimes how healing lets us look.",
  "By page 20, strangers were adding reflections. By page 44, someone in Canada said the story made them call their sister.",
  "By page 71, a man in South Africa wrote that he was going to reopen his repair table.",
  "By page 100, Amina had stopped refreshing and started crying.",
  "The Human Verdict for her story said: starting again is not one dramatic leap. It is repeated evidence that you still trust tomorrow.",
  "Amina sent that sentence to her mother.",
  "Her mother replied: I am proud of you. Then, because mothers are still mothers, she added: also eat properly.",
  "The app asked readers one final question: What is one link you can add to someone else's beginning?",
  "Answers came for days. People offered advice, prayers, warnings, jokes, recipes, savings methods, and the phone numbers of suppliers in different cities.",
  "Amina realized her story had become a room. People entered with their own burdens and left with one usable thing.",
  "That was bigger than inspiration. Inspiration fades. Usable things remain.",
  "She used part of the tips to buy a better table. She used part to pay rent. She saved part because the future deserved respect.",
  "A journalist messaged through HumanChain, asking to visit. Amina declined politely. Not everything real needs to become content.",
  "Instead, she agreed to answer questions in the Business Room every Wednesday evening.",
  "Her title changed from Chain Keeper to Trusted Voice. She still burned tea sometimes.",
  "The title did not make her perfect. It made her responsible.",
  "One evening, a girl asked: How do I begin when I am ashamed of being seen trying?",
  "Amina recorded a voice answer. Her voice was steady.",
  "She said: begin small enough that shame gets bored. Then repeat until confidence arrives late and pretends it was always with you.",
  "The girl saved it. Then tipped 1 WLD. Amina sent the tip back with a message: buy your first material.",
  "The app did not have a button for what passed between them. Maybe it was faith. Maybe it was continuity.",
  "HumanChain called it a link.",
  "By the next rainy season, the tea stand had a name painted in blue letters: Second Morning.",
  "The name came from a HumanChain answer from Vietnam: every person deserves a second morning.",
  "People began taking photos beside the sign. Amina found this ridiculous and secretly wonderful.",
  "When tourists asked the meaning, she said, It means yesterday lost.",
  "On the anniversary of her first post, HumanChain reminded her: One year ago, you wrote, I am tired, but I have not disappeared.",
  "Below it, the app showed the chain that followed. Thousands of humans had added their own versions.",
  "I am afraid, but I am learning. I am broke, but I am building. I am grieving, but I am cooking. I am alone, but I am here.",
  "The chain was not happy. It was better than happy. It was honest.",
  "Amina added a new link: I disappeared from who I was, but not from who I could become.",
  "This time she did not almost delete it.",
  "She pressed send and felt the familiar thread extend from her small screen into the large, impossible world.",
  "Somewhere, a stranger would read it at the right hour. Somewhere, a person would feel less alone for three seconds.",
  "Three seconds is not small when someone is close to giving up.",
  "The final page of Amina's story was not an ending. Human stories rarely end where apps place the last page.",
  "It was a handoff.",
  "The app asked: What will you do with the link you have been given?",
  "Amina looked at the morning line forming near Second Morning. Ruth was laughing. The city was loud. The tea was ready.",
  "She put the phone away.",
  "Being human was not only telling the story.",
  "It was returning to the work with more tenderness than before.",
  "And somewhere inside HumanChain, the world kept answering.",
];

const storyPages = Array.from({ length: 150 }, (_, index) => {
  const image =
    index === 0 || (index + 1) % 15 === 0
      ? storyImages[Math.floor(index / 15) % storyImages.length]
      : null;

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
            <img alt={`Story scene page ${current.page}`} src={current.image} />
          ) : null}
          <span className="section-kicker">The Day I Started Again</span>
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
        <h2>The Day I Started Again</h2>
        <p>
          A 150-page true-feeling story about rebuilding, work, dignity, and the
          strangers who help us return to ourselves.
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
          "Coins in her palm",
          "The first link",
          "Tea before sunrise",
          "The world answers",
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
