"use client";

import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Code2,
  Compass,
  Download,
  ExternalLink,
  HeartHandshake,
  Layers3,
  Mail,
  Menu,
  Mountain,
  Radio,
  Send,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import styles from "./personal-home.module.css";

type Accent = "electrical" | "development" | "design" | "nature" | "human";

const navItems = [
  { label: "About", href: "#identity" },
  { label: "Work", href: "#work" },
  { label: "Writing", href: "#writing" },
  { label: "CV", href: "#cv" },
  { label: "Contact", href: "#contact" },
];

const signals: { label: string; accent: Accent }[] = [
  { label: "Electrical", accent: "electrical" },
  { label: "Development", accent: "development" },
  { label: "Design", accent: "design" },
  { label: "Nature", accent: "nature" },
  { label: "Human", accent: "human" },
];

const identityRoles = [
  {
    number: "01",
    title: "The Electrician",
    icon: Zap,
    accent: "electrical" as Accent,
    copy: "I learned systems through conduit, panels, load paths, faults, and the kind of precision that cannot be hand-waved.",
    tags: ["Field logic", "Safety", "Diagnostics"],
    note: "It makes my digital work practical, inspectable, and grounded in consequences.",
  },
  {
    number: "02",
    title: "The Developer",
    icon: Code2,
    accent: "development" as Accent,
    copy: "I build interfaces, APIs, and product flows that turn messy signals into tools people can actually use.",
    tags: ["React", "APIs", "Systems"],
    note: "It keeps the experience fast, maintainable, and clear under pressure.",
  },
  {
    number: "03",
    title: "The Designer",
    icon: Layers3,
    accent: "design" as Accent,
    copy: "I care about hierarchy, rhythm, typography, motion, and the quiet details that make software feel alive.",
    tags: ["UI/UX", "Motion", "Design systems"],
    note: "It turns raw functionality into something people can understand and trust.",
  },
  {
    number: "04",
    title: "The Explorer",
    icon: Mountain,
    accent: "nature" as Accent,
    copy: "Trails, weather, terrain, and open air reset my thinking. Nature reminds me that systems are living things.",
    tags: ["Observation", "Resilience", "Mapping"],
    note: "It gives my work patience, spatial awareness, and better questions.",
  },
  {
    number: "05",
    title: "The Human",
    icon: HeartHandshake,
    accent: "human" as Accent,
    copy: "The point is not clever technology. The point is useful connection between people, tools, places, and time.",
    tags: ["Clarity", "Trust", "Collaboration"],
    note: "It keeps every system pointed at someone real.",
  },
];

const beliefs = [
  {
    number: "01",
    title: "Every system is connected",
    copy: "A wire, a route, a data model, and a conversation all fail or flow through relationships.",
    icon: CircuitBoard,
  },
  {
    number: "02",
    title: "Craft is respect",
    copy: "Clean work is a signal that the next person matters, even when that person is future you.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "The outdoors resets the signal",
    copy: "Distance from screens makes the work sharper when it is time to return to the build.",
    icon: Compass,
  },
];

const projects = [
  {
    title: "ElectriMap",
    category: ["Electrical", "Mobile UI"],
    status: "Prototype",
    year: "2026",
    description: "A mobile circuit diagramming interface for electricians mapping panels, rooms, breakers, and handoff notes.",
    tools: ["React", "Maps", "SVG"],
    impact: "Demo case study focused on faster field documentation.",
    accent: "electrical" as Accent,
  },
  {
    title: "Terrain Journal",
    category: ["Outdoors", "Product"],
    status: "Concept",
    year: "2026",
    description: "A GPS journaling surface for trails, photo pins, weather notes, and the memory of moving through terrain.",
    tools: ["Next.js", "Geodata", "Motion"],
    impact: "Concept exploration for reflective outdoor tools.",
    accent: "nature" as Accent,
  },
  {
    title: "RawPanel UI",
    category: ["Design System", "Interface"],
    status: "Demo",
    year: "2026",
    description: "A warm, open component system for buttons, cards, forms, tokens, and field-ready software surfaces.",
    tools: ["Tokens", "Figma", "CSS"],
    impact: "Demo case study for visual consistency and reuse.",
    accent: "design" as Accent,
  },
  {
    title: "Circuit Planner",
    category: ["Web Tool", "Planning"],
    status: "Prototype",
    year: "2026",
    description: "A planning tool for residential and light commercial layouts, loads, zones, and installation decisions.",
    tools: ["React", "Forms", "Data"],
    impact: "Prototype for clearer pre-install planning.",
    accent: "development" as Accent,
  },
  {
    title: "Field Notes App",
    category: ["Trades", "Voice"],
    status: "Concept",
    year: "2026",
    description: "Voice and photo notes for tradespeople who need fast capture without fighting a bloated app.",
    tools: ["Mobile UX", "Media", "AI"],
    impact: "Concept for reducing admin friction after site work.",
    accent: "human" as Accent,
  },
  {
    title: "Portfolio OS",
    category: ["Personal Site", "3D"],
    status: "Live build",
    year: "2026",
    description: "An OS-inspired portfolio system built around signals, case studies, writing, and cinematic interaction.",
    tools: ["Next.js", "CSS 3D", "Motion"],
    impact: "A public interface for the Raw Signal body of work.",
    accent: "development" as Accent,
  },
];

const articles = [
  ["Jun 2026", "Field Notes", "What wiring a panel taught me about architecture", "A short reflection on structure, labels, load, and why invisible order matters."],
  ["May 2026", "Design", "Design as a second language", "How visual hierarchy became a way to explain systems before they are fully built."],
  ["Apr 2026", "Product", "Why field tools need fewer features", "Tradespeople do not need louder software. They need tools that respect time and context."],
  ["Mar 2026", "Code", "The difference between clean code and honest code", "Clean code reads well. Honest code admits constraints, edge cases, and future maintenance."],
  ["Feb 2026", "Nature", "What nature teaches about systems", "Trails, rivers, and weather are patient teachers for anyone designing digital products."],
];

const skillGroups = [
  ["Electrical", ["Conduit & cable installation", "Panel design & installation", "Fault diagnosis", "Schematic reading", "Safety protocols"]],
  ["Digital", ["Frontend development", "Backend & APIs", "React / Next.js", "TypeScript", "Responsive UI"]],
  ["Design", ["Figma", "UI/UX", "Design systems", "Typography", "Motion design", "Visual hierarchy"]],
  ["Human", ["Clear communication", "Patience", "Precision", "Problem solving", "Honest collaboration"]],
];

function RawSignalIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 3600);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.intro} aria-label="RawSignal OS introduction">
      <button className={styles.skipIntro} onClick={() => setVisible(false)} type="button">
        Skip Intro
      </button>
      <div className={styles.introGrid} aria-hidden="true" />
      <div className={styles.introCore}>
        <div className={styles.signalDot} />
        <div className={styles.osCube}>
          <span />
          <span />
          <span />
        </div>
        <p>RAWSIGNAL OS v2.0</p>
        <strong>Initializing core modules...</strong>
        <div className={styles.moduleStack}>
          {signals.map((signal) => (
            <span className={styles[signal.accent]} key={signal.label}>
              {signal.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.mobileMenuWrap}>
      <button className={styles.iconButton} aria-label="Open menu" type="button" onClick={() => setOpen(true)}>
        <Menu size={20} aria-hidden="true" />
      </button>
      {open ? (
        <div className={styles.mobileMenu}>
          <button className={styles.iconButton} aria-label="Close menu" type="button" onClick={() => setOpen(false)}>
            <X size={20} aria-hidden="true" />
          </button>
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeroCore() {
  return (
    <div className={styles.heroVisual} aria-label="Interactive RawSignal circuit core visual">
      <div className={styles.orbit} />
      <div className={styles.coreShell}>
        <div className={styles.coreFace}>
          <CircuitBoard size={42} aria-hidden="true" />
          <span>OS CORE</span>
        </div>
      </div>
      <div className={`${styles.signalModule} ${styles.moduleOne}`}>Electrical</div>
      <div className={`${styles.signalModule} ${styles.moduleTwo}`}>Development</div>
      <div className={`${styles.signalModule} ${styles.moduleThree}`}>Design</div>
      <div className={`${styles.signalModule} ${styles.moduleFour}`}>Nature</div>
      <div className={`${styles.signalModule} ${styles.moduleFive}`}>Human</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.sectionLabel}>
      <Radio size={15} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function ContactForm() {
  const [state, setState] = useState<"idle" | "success" | "error">("idle");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    setState(email.includes("@") ? "success" : "error");
  }

  return (
    <form className={styles.contactForm} onSubmit={submit} noValidate>
      <label htmlFor="email">Email</label>
      <div>
        <input id="email" name="email" type="email" placeholder="you@example.com" aria-describedby="contact-status" />
        <button type="submit">
          <Send size={17} aria-hidden="true" />
          Subscribe
        </button>
      </div>
      <p id="contact-status" role="status">
        {state === "success" ? "You are on the signal list. Thank you." : null}
        {state === "error" ? "Enter a valid email so I can send the notes to the right place." : null}
      </p>
    </form>
  );
}

export default function PersonalHome() {
  return (
    <main className={styles.page}>
      <RawSignalIntro />
      <div className={styles.backdrop} aria-hidden="true" />

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Josiah Raw Signal home">
          <span className={styles.brandMark}>RS</span>
          <span>Josiah - Raw Signal</span>
        </a>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>{item.label}</a>
          ))}
        </nav>
        <MobileMenu />
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>I build systems that connect circuits, code, and people.</h1>
          <p>
            I am Josiah, an electrician, developer, and designer turning hands-on field logic into digital products that feel clear, useful, and alive.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#work">View Work <ArrowRight size={18} aria-hidden="true" /></a>
            <a className={styles.secondaryAction} href="#identity">Read My Story</a>
            <a className={styles.ghostAction} href="#cv"><Download size={17} aria-hidden="true" /> Download CV</a>
          </div>
          <div className={styles.chipRow} aria-label="Core skills">
            {[
              "Electrical Systems",
              "Web Apps",
              "UI/UX Design",
              "Design Systems",
              "Field Tools",
              "Human-Centered Products",
            ].map((chip) => <span key={chip}>{chip}</span>)}
          </div>
        </div>
        <HeroCore />
      </section>

      <section id="identity" className={styles.section}>
        <SectionLabel>Identity</SectionLabel>
        <div className={styles.sectionHeader}>
          <h2>I Am Many Things</h2>
          <p>Five signals shape the work: practical electricity, software structure, design craft, outdoor clarity, and human attention.</p>
        </div>
        <div className={styles.roleGrid}>
          {identityRoles.map((role) => {
            const Icon = role.icon;
            return (
              <article className={`${styles.roleCard} ${styles[role.accent]}`} key={role.title}>
                <span>{role.number}</span>
                <div className={styles.visualPanel}><Icon size={30} aria-hidden="true" /></div>
                <h3>{role.title}</h3>
                <p>{role.copy}</p>
                <div className={styles.tagRow}>{role.tags.map((tag) => <b key={tag}>{tag}</b>)}</div>
                <small>{role.note}</small>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <SectionLabel>Beliefs</SectionLabel>
        <div className={styles.beliefGrid}>
          {beliefs.map((belief) => {
            const Icon = belief.icon;
            return (
              <article className={styles.beliefCard} key={belief.title}>
                <span>{belief.number}</span>
                <Icon size={28} aria-hidden="true" />
                <h3>{belief.title}</h3>
                <p>{belief.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="work" className={styles.section}>
        <SectionLabel>Featured Work</SectionLabel>
        <div className={styles.sectionHeader}>
          <h2>Product modules inside the RawSignal OS.</h2>
          <p>Honest case-study cards: concepts and prototypes are labeled clearly until real shipped metrics exist.</p>
        </div>
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <article className={`${styles.projectCard} ${styles[project.accent]}`} key={project.title}>
              <div className={styles.projectTop}>
                <div>{project.category.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <b>{project.status}</b>
              </div>
              <div className={styles.projectVisual}><BrainCircuit size={34} aria-hidden="true" /></div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <dl>
                <div><dt>Year</dt><dd>{project.year}</dd></div>
                <div><dt>Tools</dt><dd>{project.tools.join(" / ")}</dd></div>
                <div><dt>Outcome</dt><dd>{project.impact}</dd></div>
              </dl>
              <a href="#contact">View Case Study <ChevronRight size={16} aria-hidden="true" /></a>
            </article>
          ))}
        </div>
      </section>

      <section id="writing" className={styles.section}>
        <SectionLabel>Thinking Out Loud</SectionLabel>
        <div className={styles.editorialGrid}>
          {articles.map(([date, category, title, summary]) => (
            <article className={styles.articleCard} key={title}>
              <span>{date} / {category}</span>
              <h3>{title}</h3>
              <p>{summary}</p>
              <a href="#contact">Read note <ExternalLink size={15} aria-hidden="true" /></a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.manifesto}>
        <div className={styles.signalLines} aria-hidden="true" />
        <h2>BUILD.<br /><span>CONNECT.</span><br />GROW.<br />REPEAT.</h2>
        <p>The best work happens where physical systems, digital tools, and human attention meet. I build at that intersection.</p>
        <a className={styles.primaryAction} href="#contact">Start a conversation <ArrowRight size={18} aria-hidden="true" /></a>
      </section>

      <section id="cv" className={styles.section}>
        <SectionLabel>Skills & Tools</SectionLabel>
        <div className={styles.skillGrid}>
          {skillGroups.map(([group, skills]) => (
            <article className={styles.skillCard} key={group as string}>
              <h3>{group as string}</h3>
              {(skills as string[]).map((skill) => (
                <div className={styles.skillLine} key={skill}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{skill}</span>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className={styles.contact}>
        <div>
          <SectionLabel>Contact</SectionLabel>
          <h2>Think alongside me.</h2>
          <p>Occasional writing on building, designing, and living. No spam. Ever.</p>
          <div className={styles.contactActions}>
            <a href="mailto:hello@rawsignal.dev"><Mail size={17} aria-hidden="true" /> Contact</a>
            <a href="https://github.com" aria-label="GitHub"><Code2 size={18} aria-hidden="true" /> GitHub</a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><BriefcaseBusiness size={18} aria-hidden="true" /> LinkedIn</a>
          </div>
        </div>
        <ContactForm />
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Josiah - Raw Signal</strong>
          <p>I wire things - circuits, code, and connections.</p>
        </div>
        <nav aria-label="Footer navigation">
          {navItems.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
        </nav>
        <span>(c) 2026 Josiah. Built by Josiah - Raw Signal</span>
      </footer>
    </main>
  );
}


