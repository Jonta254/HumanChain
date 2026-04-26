"use client";

import {
  BookOpen,
  CircleDollarSign,
  Flame,
  Globe2,
  Home,
  Library,
  MessageCircleQuestion,
  Mic2,
  PenLine,
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

const chainLinks = [
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

const wldActions = [
  ["1 WLD", "Tip, Golden Link, or streak restore"],
  ["2 WLD", "Pin a link or unlock story pages"],
  ["3 WLD", "Ask one country or save a capsule"],
  ["4 WLD", "Ask privately as a verified human"],
  ["5 WLD", "Request voice answers"],
  ["6 WLD", "Unlock Deep Human Verdict"],
];

type Tab = "home" | "ask" | "chains" | "stories" | "me";

export default function HumanChainApp() {
  const [tab, setTab] = useState<Tab>("home");
  const activeView = useMemo(() => {
    switch (tab) {
      case "ask":
        return <AskView />;
      case "chains":
        return <ChainsView />;
      case "stories":
        return <StoriesView />;
      case "me":
        return <MeView />;
      default:
        return <HomeView setTab={setTab} />;
    }
  }, [tab]);

  return (
    <main className="app-shell">
      <section className="phone-frame">
        {activeView}
        <BottomNav active={tab} onChange={setTab} />
      </section>
    </main>
  );
}

function HomeView({ setTab }: { setTab: (tab: Tab) => void }) {
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
          detail="This month's life story"
          onClick={() => setTab("stories")}
        />
      </section>

      <section className="streak-card">
        <div>
          <span className="section-kicker">Human Streak</span>
          <h2>4-day chain alive</h2>
          <p>Add one meaningful action today to keep your chain growing.</p>
        </div>
        <div className="chain-days" aria-label="4 day streak">
          <span />
          <span />
          <span />
          <span />
        </div>
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

function AskView() {
  return (
    <div className="screen">
      <TopBar title="Ask The World" subtitle="One question. Verified human answers." />
      <section className="ask-box">
        <label htmlFor="question">What do you want to ask humanity?</label>
        <textarea
          id="question"
          placeholder="Example: Should I leave my job and start my own business?"
        />
        <div className="chip-row">
          {["Love", "Money", "Business", "Family", "Culture"].map((chip) => (
            <button key={chip} type="button">
              {chip}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>WLD Reach</span>
          <CircleDollarSign size={18} />
        </div>
        <div className="wld-grid">
          {wldActions.map(([price, detail]) => (
            <button className="wld-button" key={price} type="button">
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
        ].map((question) => (
          <article className="question-row" key={question}>
            <p>{question}</p>
            <button type="button">Answer</button>
          </article>
        ))}
      </section>
    </div>
  );
}

function ChainsView() {
  return (
    <div className="screen">
      <TopBar title="Daily Human Chain" subtitle="One link from every human." />
      <section className="today-chain">
        <span className="section-kicker">Today's Chain</span>
        <h2>What should the world remember today?</h2>
        <button type="button">Add My Link</button>
      </section>
      <section className="thread-list" aria-label="Human thread">
        {chainLinks.map((link) => (
          <article className="thread-item" key={`${link.country}-${link.text}`}>
            <span className="thread-dot" />
            <div>
              <strong>{link.country}</strong>
              <p>{link.text}</p>
              <div className="reaction-row">
                <button type="button">I felt this</button>
                <button type="button">Tip 1 WLD</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function StoriesView() {
  return (
    <div className="screen">
      <TopBar title="Human Story" subtitle="A monthly story about being human." />
      <section className="story-cover">
        <span>April Human Story</span>
        <h2>The Day I Started Again</h2>
        <p>
          A real story told in pages, with reflections from verified humans
          around the world.
        </p>
        <button type="button">Read Story</button>
      </section>
      <section className="story-pages">
        {[
          "Before everything changed",
          "The moment I broke",
          "The choice I made",
          "What the world says",
        ].map((page, index) => (
          <article key={page}>
            <span>Page {index + 1}</span>
            <h3>{page}</h3>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="section-heading">
          <span>Story WLD actions</span>
          <Library size={18} />
        </div>
        <div className="compact-actions">
          <button type="button">1 WLD Tip Storyteller</button>
          <button type="button">2 WLD Bonus Pages</button>
          <button type="button">6 WLD Deep Reflection</button>
        </div>
      </section>
    </div>
  );
}

function MeView() {
  return (
    <div className="screen">
      <TopBar title="My Human Passport" subtitle="Your chain across the world." />
      <section className="profile-card">
        <div className="avatar">HC</div>
        <div>
          <h2>Verified Human</h2>
          <p>Chain Keeper. 4-day Human Streak.</p>
        </div>
      </section>
      <section className="stats-grid">
        <Stat label="Questions" value="3" />
        <Stat label="Answers" value="18" />
        <Stat label="Links" value="9" />
        <Stat label="Countries" value="12" />
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
