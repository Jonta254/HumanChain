"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Clock,
  Globe2,
  Languages,
  MessageCircle,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { chatWithWorld } from "@/lib/world";
import {
  formatShortTime,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { saveJsonToStorage, loadJsonFromStorage } from "@/lib/humanchain/storage";
import type { EarnPoints, OpenPayment } from "@/types/ui";
import type { HumanIdentity } from "@/types/user";
import type { HistoryRecord } from "@/types/reputation";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const NICHES = [
  { id: "all",           label: "All",           icon: Sparkles,  color: "#2f6fed" },
  { id: "legal",         label: "Legal",         icon: Scale,     color: "#2f6fed" },
  { id: "translation",   label: "Translation",   icon: Languages, color: "#246b55" },
  { id: "manufacturing", label: "Manufacturing", icon: Wrench,    color: "#ef7d69" },
  { id: "consulting",    label: "Consulting",    icon: Briefcase, color: "#b98218" },
];

const SEED_JOBS = [
  {
    id: "j1", type: "job" as const, niche: "translation",
    title: "Swahili–Portuguese Medical Document Translation",
    detail: "8 case files, ~4,000 words. Medical terminology required. 5-day turnaround.",
    budget: "WLD 85", region: "Kenya → Brazil", deadline: "5 days",
    proposals: 3, urgent: true, poster: "@mercy_clinic",
    skills: ["Medical terms", "Swahili", "Portuguese"], color: "#246b55",
  },
  {
    id: "j2", type: "job" as const, niche: "legal",
    title: "South African Mining Regulation Consultant",
    detail: "MPRDA compliance review for a new operation. Remote advisory welcome.",
    budget: "WLD 220", region: "South Africa", deadline: "12 days",
    proposals: 7, urgent: false, poster: "@khumalo_mining",
    skills: ["SA mining law", "MPRDA", "Compliance"], color: "#2f6fed",
  },
  {
    id: "j3", type: "job" as const, niche: "manufacturing",
    title: "Custom Motorcycle Parts Fabricator — Colombia",
    detail: "CNC machining for custom exhaust and brake components. Small batch of 20 units.",
    budget: "WLD 340", region: "Latin America", deadline: "21 days",
    proposals: 2, urgent: false, poster: "@moto_bogota",
    skills: ["CNC machining", "Steel fabrication", "Custom parts"], color: "#ef7d69",
  },
  {
    id: "j4", type: "job" as const, niche: "legal",
    title: "Hausa Business Contract Review",
    detail: "Partnership agreement in English and Hausa. Nigerian commercial law required.",
    budget: "WLD 60", region: "Nigeria", deadline: "3 days",
    proposals: 1, urgent: true, poster: "@lagos_ventures",
    skills: ["Hausa", "Nigerian law", "Contracts"], color: "#b98218",
  },
  {
    id: "j5", type: "job" as const, niche: "translation",
    title: "Amharic → English Medical Consent Forms",
    detail: "Hospital consent and discharge forms. 3 documents. Certified translation preferred.",
    budget: "WLD 45", region: "Ethiopia → UK", deadline: "7 days",
    proposals: 4, urgent: false, poster: "@addis_health",
    skills: ["Amharic", "Medical translation", "English"], color: "#246b55",
  },
  {
    id: "j6", type: "job" as const, niche: "consulting",
    title: "Market Entry Consultant — Philippines Healthcare",
    detail: "FDA Philippines registration guidance for a medical device. Prior experience required.",
    budget: "WLD 180", region: "Philippines", deadline: "14 days",
    proposals: 5, urgent: false, poster: "@medtech_ph",
    skills: ["FDA PH", "Healthcare", "Market entry"], color: "#6657d9",
  },
];

const SEED_PROVIDERS = [
  { id: "p1", name: "Kwame Asante", initial: "K", specialty: "Medical & Legal Translation",  niche: "translation",    region: "Ghana",           rating: 5.0, jobs: 132, color: "#246b55" },
  { id: "p2", name: "Amara Diallo", initial: "A", specialty: "West African Commercial Law",  niche: "legal",          region: "Senegal",         rating: 4.9, jobs: 84,  color: "#2f6fed" },
  { id: "p3", name: "Lena Morales", initial: "L", specialty: "CNC & Custom Fabrication",     niche: "manufacturing",  region: "Guadalajara, MX", rating: 4.8, jobs: 61,  color: "#ef7d69" },
  { id: "p4", name: "Priya Nair",   initial: "P", specialty: "South Asian Healthcare",       niche: "consulting",     region: "Bangalore, IN",   rating: 4.7, jobs: 49,  color: "#b98218" },
  { id: "p5", name: "Fatou Bah",    initial: "F", specialty: "Francophone African Law",      niche: "legal",          region: "Dakar, SN",       rating: 4.8, jobs: 37,  color: "#6657d9" },
];

const DEADLINE_OPTIONS = ["3 days", "1 week", "2 weeks", "1 month", "Flexible"];
const BUDGET_PRESETS   = ["WLD 25", "WLD 50", "WLD 100", "WLD 200", "WLD 500"];

const MARKET_PULSE = [
  ["Verified scope", "Jobs + services", "Deliverables, budget, and deadline before chat."],
  ["Payment rail", "WLD escrow", "Posting fees are shown before public listings go live."],
  ["Market reach", "Region-first", "Search by specialty, language, client region, or provider base."],
] as const;

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

type MarketMode = "browse" | "post-job" | "offer-service";

interface LocalJob {
  id: string; type: "job"; niche: string; title: string; detail: string;
  budget: string; region: string; deadline: string; proposals: number;
  urgent: boolean; poster: string; skills: string[]; color: string; postedAt: string;
}

interface LocalService {
  id: string; type: "service"; niche: string; title: string; detail: string;
  rate: string; region: string; languages: string; provider: string;
  rating: number; jobs: number; color: string; postedAt: string;
}

type AnyJob = typeof SEED_JOBS[number] | LocalJob;
type ListingItem = AnyJob | LocalService;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarketplaceView({
  act,
  earnPoints,
  humanIdentity,
  openPayment,
  recordHistory,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  humanIdentity: HumanIdentity | null;
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
}) {
  const [mode, setMode]               = useState<MarketMode>("browse");
  const [activeNiche, setActiveNiche] = useState("all");
  const [search, setSearch]           = useState("");
  const [activeItem, setActiveItem]   = useState<ListingItem | null>(null);
  const [localJobs, setLocalJobs]     = useState<LocalJob[]>(() =>
    loadJsonFromStorage<LocalJob[]>("hc_local_jobs", []),
  );
  const [localServices, setLocalServices] = useState<LocalService[]>(() =>
    loadJsonFromStorage<LocalService[]>("hc_local_services", []),
  );

  const [jobForm, setJobFormState] = useState({
    title: "", detail: "", niche: "legal", budget: "", deadline: "1 week", region: "",
  });
  const [serviceForm, setServiceFormState] = useState({
    title: "", detail: "", niche: "translation", rate: "", region: "", languages: "",
  });

  const handle     = humanIdentity?.username ?? "@you";

  function setJob(field: keyof typeof jobForm, value: string) {
    setJobFormState((c) => ({ ...c, [field]: value }));
  }
  function setService(field: keyof typeof serviceForm, value: string) {
    setServiceFormState((c) => ({ ...c, [field]: value }));
  }

  function nicheColor(niche: string) {
    return NICHES.find((n) => n.id === niche)?.color ?? "#2f6fed";
  }

  const allListings: ListingItem[] = [...SEED_JOBS, ...localJobs, ...localServices];
  const filtered = allListings.filter((item) => {
    const matchesNiche = activeNiche === "all" || item.niche === activeNiche;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      `${item.title} ${item.niche} ${item.region ?? ""}`.toLowerCase().includes(q);
    return matchesNiche && matchesSearch;
  });

  const jobs     = filtered.filter((i) => i.type === "job") as AnyJob[];
  const services = filtered.filter((i) => i.type === "service") as LocalService[];
  const featured = SEED_JOBS.filter((j) => j.urgent);

  async function openChat(poster: string, itemTitle: string) {
    try {
      await chatWithWorld({
        message: `Hi ${poster}, I saw your listing "${itemTitle}" on HumanChain. Is it still open?`,
        to: [poster.replace(/^@/, "")],
      });
      act("World Chat opened", `Direct chat with ${poster} is ready.`);
    } catch {
      act("Chat unavailable", "Try opening World App chat directly.");
    }
  }

  function submitJob() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "posting jobs")) return;
    const { title, detail, budget } = jobForm;
    if (!title.trim() || !detail.trim() || !budget.trim()) {
      act("Missing details", "Add a title, description, and budget to post.");
      return;
    }
    openPayment({
      title:   "Post a Job — 2 WLD",
      amount:  "2 WLD",
      detail:  "Your job goes live to verified specialists worldwide.",
      success: "Job posted! Verified providers will send proposals.",
      feature: "marketplace-job-post",
      points:  10,
      onConfirmed: () => {
        const job: LocalJob = {
          id: `lj-${Date.now()}`, type: "job", niche: jobForm.niche,
          title: title.trim(), detail: detail.trim(),
          budget: budget.trim().startsWith("WLD") ? budget.trim() : `WLD ${budget.trim()}`,
          region: jobForm.region.trim() || "Worldwide",
          deadline: jobForm.deadline, proposals: 0, urgent: false,
          poster: handle, skills: [], color: nicheColor(jobForm.niche),
          postedAt: formatShortTime(),
        };
        const next = [job, ...localJobs];
        setLocalJobs(next);
        saveJsonToStorage("hc_local_jobs", next);
        recordHistory({ title: "Job posted", detail: `${title} · ${budget}`, kind: "market" });
        earnPoints(10, "Job posted to HumanChain marketplace.");
        setJobFormState({ title: "", detail: "", niche: "legal", budget: "", deadline: "1 week", region: "" });
        setMode("browse");
      },
    });
  }

  function submitService() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "listing services")) return;
    const { title, detail, rate } = serviceForm;
    if (!title.trim() || !detail.trim() || !rate.trim()) {
      act("Missing details", "Add a title, description, and rate to list.");
      return;
    }
    openPayment({
      title:   "List Your Service — 2 WLD",
      amount:  "2 WLD",
      detail:  "Your profile goes live to clients worldwide.",
      success: "Service listed! Clients can now find and contact you.",
      feature: "marketplace-service-listing",
      points:  12,
      onConfirmed: () => {
        const svc: LocalService = {
          id: `ls-${Date.now()}`, type: "service", niche: serviceForm.niche,
          title: title.trim(), detail: detail.trim(),
          rate: rate.trim().startsWith("WLD") ? rate.trim() : `WLD ${rate.trim()}`,
          region: serviceForm.region.trim() || "Worldwide",
          languages: serviceForm.languages.trim(),
          provider: handle, rating: 0, jobs: 0,
          color: nicheColor(serviceForm.niche), postedAt: formatShortTime(),
        };
        const next = [svc, ...localServices];
        setLocalServices(next);
        saveJsonToStorage("hc_local_services", next);
        recordHistory({ title: "Service listed", detail: `${title} · ${rate}`, kind: "market" });
        earnPoints(12, "Service listing published.");
        setServiceFormState({ title: "", detail: "", niche: "translation", rate: "", region: "", languages: "" });
        setMode("browse");
      },
    });
  }

  // ── Detail screen ─────────────────────────────────────────────────────────
  if (activeItem) {
    const isJob    = activeItem.type === "job";
    const color    = activeItem.color;
    const poster   = isJob ? (activeItem as AnyJob).poster : (activeItem as LocalService).provider;
    const budget   = isJob ? (activeItem as AnyJob).budget : (activeItem as LocalService).rate;
    const deadline = isJob ? (activeItem as AnyJob).deadline : null;
    const proposals = isJob ? (activeItem as AnyJob).proposals : null;
    const skills   = isJob ? (activeItem as AnyJob).skills : [];
    const languages = !isJob ? (activeItem as LocalService).languages : null;

    return (
      <div className="screen mk-detail">
        <div className="mk-detail-hero" style={{ "--dc": color } as React.CSSProperties}>
          <button className="mk-back" onClick={() => setActiveItem(null)} type="button">
            <ArrowLeft size={15} />Back
          </button>
          <span className="mk-detail-niche">{activeItem.niche}</span>
          <h1>{activeItem.title}</h1>
          <div className="mk-detail-meta">
            <span><Globe2 size={12} />{activeItem.region}</span>
            {deadline  && <span><Clock size={12} />{deadline} left</span>}
            {proposals !== null && <span><Users size={12} />{proposals} proposals</span>}
          </div>
        </div>

        <div className="mk-detail-body">
          <div className="mk-detail-budget-row">
            <div>
              <span>{isJob ? "Budget" : "Starting rate"}</span>
              <strong>{budget}</strong>
            </div>
            <span className="mk-escrow-badge"><ShieldCheck size={12} />Escrow</span>
          </div>

          <section className="mk-detail-section">
            <strong>Description</strong>
            <p>{activeItem.detail}</p>
          </section>

          {skills.length > 0 && (
            <section className="mk-detail-section">
              <strong>Skills needed</strong>
              <div className="mk-skill-chips">
                {skills.map((s) => <span key={s}>{s}</span>)}
              </div>
            </section>
          )}

          {languages && (
            <section className="mk-detail-section">
              <strong>Languages / regions</strong>
              <p>{languages}</p>
            </section>
          )}

          <div className="mk-detail-trust">
            <span><BadgeCheck size={12} />World ID verified</span>
            <span><ShieldCheck size={12} />WLD escrow on hire</span>
            <span><Zap size={12} />Milestone payments</span>
          </div>

          <div className="mk-detail-actions">
            <button
              className="mk-cta-primary"
              onClick={() => {
                if (!requireVerifiedPublicAction(humanIdentity, act, isJob ? "applying to jobs" : "contacting providers")) return;
                void openChat(poster, activeItem.title);
              }}
              type="button"
            >
              <MessageCircle size={15} />
              {isJob ? "Apply via World Chat" : "Contact Provider"}
            </button>
            <button className="mk-cta-secondary" onClick={() => setActiveItem(null)} type="button">
              Back to listings
            </button>
          </div>

          <div className="mk-detail-poster">
            <div className="mk-poster-av" style={{ background: `linear-gradient(135deg,${color}cc,${color}55)` }}>
              {poster.replace(/^@/, "").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{poster}</strong>
              <span>World ID Verified</span>
            </div>
            <BadgeCheck size={15} color="#2f6fed" />
          </div>
        </div>
      </div>
    );
  }

  // ── Post-job form ──────────────────────────────────────────────────────────
  if (mode === "post-job") {
    return (
      <div className="screen mk-form-screen">
        <div className="mk-form-header">
          <button className="mk-back" onClick={() => setMode("browse")} type="button">
            <ArrowLeft size={15} />Back
          </button>
          <h1>Post a Job</h1>
          <p>Describe what you need. Verified specialists will send proposals.</p>
        </div>

        <div className="mk-form-body">
          <label className="mk-field">
            <span>What do you need? <em>*</em></span>
            <input placeholder="e.g. Translate 3 medical documents Swahili → English"
              value={jobForm.title} onChange={(e) => setJob("title", e.target.value)} />
          </label>

          <label className="mk-field">
            <span>Details <em>*</em></span>
            <textarea placeholder="Scope, timeline, deliverables, special requirements…"
              rows={4} value={jobForm.detail} onChange={(e) => setJob("detail", e.target.value)} />
          </label>

          <div className="mk-field">
            <span className="mk-label">Specialty</span>
            <div className="mk-niche-picker">
              {NICHES.filter((n) => n.id !== "all").map((n) => {
                const Icon = n.icon;
                return (
                  <button key={n.id}
                    className={`mk-niche-btn ${jobForm.niche === n.id ? "active" : ""}`}
                    style={{ "--n-color": n.color } as React.CSSProperties}
                    onClick={() => setJob("niche", n.id)} type="button">
                    <Icon size={14} />{n.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mk-field">
            <span>Budget <em>*</em></span>
            <div className="mk-presets">
              {BUDGET_PRESETS.map((p) => (
                <button key={p} className={`mk-preset ${jobForm.budget === p ? "active" : ""}`}
                  onClick={() => setJob("budget", p)} type="button">{p}</button>
              ))}
            </div>
            <input placeholder="Or type custom, e.g. WLD 75"
              value={jobForm.budget} onChange={(e) => setJob("budget", e.target.value)} />
          </label>

          <div className="mk-field">
            <span className="mk-label">Deadline</span>
            <div className="mk-presets">
              {DEADLINE_OPTIONS.map((d) => (
                <button key={d} className={`mk-preset ${jobForm.deadline === d ? "active" : ""}`}
                  onClick={() => setJob("deadline", d)} type="button">{d}</button>
              ))}
            </div>
          </div>

          <label className="mk-field">
            <span>Region</span>
            <input placeholder="e.g. West Africa, or Worldwide"
              value={jobForm.region} onChange={(e) => setJob("region", e.target.value)} />
          </label>

          <div className="mk-form-trust">
            <ShieldCheck size={13} />
            <span>2 WLD posting fee · Escrow on hire · Milestone payments</span>
          </div>

          <button className="mk-submit"
            disabled={!jobForm.title.trim() || !jobForm.detail.trim() || !jobForm.budget.trim()}
            onClick={submitJob} type="button">
            Post Job — 2 WLD
          </button>
        </div>
      </div>
    );
  }

  // ── Offer-service form ─────────────────────────────────────────────────────
  if (mode === "offer-service") {
    return (
      <div className="screen mk-form-screen">
        <div className="mk-form-header">
          <button className="mk-back" onClick={() => setMode("browse")} type="button">
            <ArrowLeft size={15} />Back
          </button>
          <h1>List Your Service</h1>
          <p>Tell clients what you offer. Receive job proposals in World Chat.</p>
        </div>

        <div className="mk-form-body">
          <label className="mk-field">
            <span>What do you offer? <em>*</em></span>
            <input placeholder="e.g. Medical document translation Swahili ↔ English"
              value={serviceForm.title} onChange={(e) => setService("title", e.target.value)} />
          </label>

          <label className="mk-field">
            <span>Description <em>*</em></span>
            <textarea placeholder="Your expertise, experience, certifications, and what clients get…"
              rows={4} value={serviceForm.detail} onChange={(e) => setService("detail", e.target.value)} />
          </label>

          <div className="mk-field">
            <span className="mk-label">Your specialty</span>
            <div className="mk-niche-picker">
              {NICHES.filter((n) => n.id !== "all").map((n) => {
                const Icon = n.icon;
                return (
                  <button key={n.id}
                    className={`mk-niche-btn ${serviceForm.niche === n.id ? "active" : ""}`}
                    style={{ "--n-color": n.color } as React.CSSProperties}
                    onClick={() => setService("niche", n.id)} type="button">
                    <Icon size={14} />{n.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mk-field">
            <span>Starting rate <em>*</em></span>
            <div className="mk-presets">
              {BUDGET_PRESETS.map((p) => (
                <button key={p} className={`mk-preset ${serviceForm.rate === p ? "active" : ""}`}
                  onClick={() => setService("rate", p)} type="button">{p}</button>
              ))}
            </div>
            <input placeholder="Or type custom, e.g. WLD 30 per 1,000 words"
              value={serviceForm.rate} onChange={(e) => setService("rate", e.target.value)} />
          </label>

          <label className="mk-field">
            <span>Languages you work in</span>
            <input placeholder="e.g. Swahili, English, French"
              value={serviceForm.languages} onChange={(e) => setService("languages", e.target.value)} />
          </label>

          <label className="mk-field">
            <span>Regions you serve</span>
            <input placeholder="e.g. East Africa, or Worldwide"
              value={serviceForm.region} onChange={(e) => setService("region", e.target.value)} />
          </label>

          <div className="mk-form-trust">
            <ShieldCheck size={13} />
            <span>2 WLD listing fee · World ID verified profile</span>
          </div>

          <button className="mk-submit"
            disabled={!serviceForm.title.trim() || !serviceForm.detail.trim() || !serviceForm.rate.trim()}
            onClick={submitService} type="button">
            List Service — 2 WLD
          </button>
        </div>
      </div>
    );
  }

  // ── Browse (default) ───────────────────────────────────────────────────────
  return (
    <div className="screen mk-browse">
      <div className="mk-header">
        <div className="mk-header-top">
          <div>
            <h1>Services</h1>
            <p>Verified · Specialized · Escrow-safe</p>
          </div>
          <div className="mk-header-btns">
            <button className="mk-btn-offer" onClick={() => setMode("offer-service")} type="button">
              <Star size={14} />Offer
            </button>
            <button className="mk-btn-post" onClick={() => setMode("post-job")} type="button">
              <Plus size={14} />Post Job
            </button>
          </div>
        </div>

        <div className="mk-search">
          <Search size={15} />
          <input aria-label="Search marketplace" placeholder="Search jobs, services, regions…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} type="button" aria-label="Clear">×</button>}
        </div>

        <div className="mk-niche-tabs">
          {NICHES.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.id}
                className={`mk-niche-tab ${activeNiche === n.id ? "active" : ""}`}
                style={{ "--n-color": n.color } as React.CSSProperties}
                onClick={() => setActiveNiche(n.id)} type="button">
                <Icon size={13} />{n.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeNiche === "all" && !search && (
        <section className="mk-pulse-strip" aria-label="Marketplace quality signals">
          {MARKET_PULSE.map(([label, value, detail]) => (
            <button
              key={label}
              onClick={() => act(label, detail)}
              type="button"
            >
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </button>
          ))}
        </section>
      )}

      {/* Featured urgent — only on All + no search */}
      {activeNiche === "all" && !search && (
        <div className="mk-section">
          <div className="mk-section-head">
            <strong>Urgent — Apply Now</strong>
            <span className="mk-live-pill"><span className="mk-pulse" />Live</span>
          </div>
          <div className="mk-featured-scroll">
            {featured.map((job) => (
              <button key={job.id} className="mk-featured-card"
                style={{ "--fc": job.color } as React.CSSProperties}
                onClick={() => setActiveItem(job)} type="button">
                <span className="mk-fc-niche">{job.niche}</span>
                <strong>{job.title}</strong>
                <div className="mk-fc-meta">
                  <span><Globe2 size={11} />{job.region}</span>
                  <span><Clock size={11} />{job.deadline}</span>
                </div>
                <div className="mk-fc-footer">
                  <strong>{job.budget}</strong>
                  <span>{job.proposals} proposals</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top providers strip */}
      {activeNiche === "all" && !search && (
        <div className="mk-section">
          <div className="mk-section-head">
            <strong>Top Specialists</strong>
          </div>
          <div className="mk-providers-row">
            {SEED_PROVIDERS.map((p) => (
              <div key={p.id} className="mk-provider-chip">
                <div className="mk-pav" style={{ background: `linear-gradient(135deg,${p.color}cc,${p.color}55)` }}>
                  {p.initial}
                  <span className="mk-pip"><BadgeCheck size={8} /></span>
                </div>
                <span>{p.name.split(" ")[0]}</span>
                <span className="mk-prating"><Star size={9} fill="currentColor" />{p.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs */}
      {jobs.length > 0 && (
        <div className="mk-section">
          <div className="mk-section-head">
            <strong>{activeNiche === "all" ? "Open Jobs" : `${NICHES.find(n => n.id === activeNiche)?.label} Jobs`}</strong>
            <span className="mk-count">{jobs.length}</span>
          </div>
          <div className="mk-list">
            {jobs.map((job) => (
              <button key={job.id} className="mk-card"
                style={{ "--cc": job.color } as React.CSSProperties}
                onClick={() => setActiveItem(job)} type="button">
                <span className="mk-card-bar" />
                <div className="mk-card-top">
                  <span className="mk-card-niche" style={{ color: job.color, background: `${job.color}18` }}>{job.niche}</span>
                  {job.urgent && <span className="mk-urgent">Urgent</span>}
                  <span className="mk-card-dl"><Clock size={10} />{job.deadline}</span>
                </div>
                <strong className="mk-card-title">{job.title}</strong>
                <div className="mk-card-meta">
                  <span><Globe2 size={11} />{job.region}</span>
                  <span><Users size={11} />{job.proposals} proposals</span>
                </div>
                {"skills" in job && job.skills.length > 0 && (
                  <div className="mk-card-skills">
                    {job.skills.slice(0, 3).map((s) => <i key={s}>{s}</i>)}
                  </div>
                )}
                <div className="mk-card-footer">
                  <strong>{job.budget}</strong>
                  <span>Apply <ArrowRight size={11} /></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <div className="mk-section">
          <div className="mk-section-head">
            <strong>Service Providers</strong>
            <span className="mk-count">{services.length}</span>
          </div>
          <div className="mk-list">
            {services.map((svc) => (
              <button key={svc.id} className="mk-card mk-svc-card"
                style={{ "--cc": svc.color } as React.CSSProperties}
                onClick={() => setActiveItem(svc)} type="button">
                <span className="mk-card-bar" />
                <div className="mk-card-top">
                  <span className="mk-card-niche" style={{ color: svc.color, background: `${svc.color}18` }}>{svc.niche}</span>
                  <span className="mk-card-provider">
                    <span className="mk-mini-av" style={{ background: `${svc.color}aa` }}>
                      {svc.provider.replace(/^@/, "").charAt(0).toUpperCase()}
                    </span>
                    {svc.provider}
                  </span>
                </div>
                <strong className="mk-card-title">{svc.title}</strong>
                {svc.detail && <p className="mk-card-detail">{svc.detail.slice(0, 90)}{svc.detail.length > 90 ? "…" : ""}</p>}
                <div className="mk-card-footer">
                  <strong>from {svc.rate}</strong>
                  <span>View <ArrowRight size={11} /></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {jobs.length === 0 && services.length === 0 && (
        <div className="mk-empty">
          <Sparkles size={30} />
          <strong>No listings found</strong>
          <p>{search ? `No results for "${search}"` : "Post a job or list your service to get started."}</p>
          <div className="mk-empty-btns">
            <button onClick={() => setMode("post-job")} type="button"><Plus size={14} />Post a Job</button>
            <button onClick={() => setMode("offer-service")} type="button"><Star size={14} />Offer Service</button>
          </div>
        </div>
      )}

      {/* Bottom sticky CTA */}
      <div className="mk-bottom-strip">
        <button onClick={() => setMode("post-job")} type="button">
          <Plus size={15} /><span>Post a Job</span><small>2 WLD</small>
        </button>
        <button onClick={() => setMode("offer-service")} type="button">
          <Star size={15} /><span>List Service</span><small>2 WLD</small>
        </button>
      </div>
    </div>
  );
}
