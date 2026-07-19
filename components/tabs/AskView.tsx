"use client";

import { useEffect, useRef, useState } from "react";
import {
  LockKeyhole,
  MessageCircleQuestion,
  Mic,
  PenLine,
  Radio,
  Search,
  Send,
} from "lucide-react";
import { Button, Haptic, useHaptics } from "@worldcoin/mini-apps-ui-kit-react";
import {
  validateAnswerInput,
  validateQuestionInput,
} from "@/lib/humanchainPolicy";
import {
  compactStorageArray,
  loadJsonFromStorage,
  saveJsonToStorage,
  storageKeys,
} from "@/lib/humanchain/storage";
import {
  isDemoItem,
  isVerifiedWorldHuman,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { starterAskThreads } from "@/lib/data/chains";
import { DataBadge } from "@/components/ui/DataBadge";
import { ReportAction } from "@/components/ui/ReportAction";
import type { AskThread } from "@/types/chain";
import type { EarnPoints, OpenPayment } from "@/types/ui";
import type { HistoryRecord } from "@/types/reputation";
import type { VerifiedHuman } from "@/types/user";

const answerQueue = [
  "What helped you keep going when nobody saw you struggling?",
  "What belief from your culture made you stronger?",
  "What should a young person know before chasing money?",
  "What is one truth about love people learn too late?",
  "How do you deal with people who don't believe in you?",
  "What does real success look like away from social media?",
  "What did failure teach you that success never could?",
  "How do you repair a relationship that broke because of money?",
  "What is the most important thing you learned from a parent?",
  "What would you tell someone who feels invisible?",
];

function loadStoredAskThreads(): AskThread[] {
  if (typeof window === "undefined") {
    return starterAskThreads;
  }

  return loadJsonFromStorage<Partial<AskThread>[]>(storageKeys.askThreads, starterAskThreads).map(
    (thread) => ({
      answers: thread.answers ?? [],
      author: thread.author ?? "@humanchain",
      id: thread.id,
      mode: thread.mode ?? "Text",
      owner: Boolean(thread.owner),
      question: thread.question ?? "Untitled question",
      source: thread.source,
      targetCountry: thread.targetCountry ?? "World",
      topic: thread.topic ?? "Life",
    }),
  );
}

export function AskView({
  act,
  aiAvailable,
  earnPoints,
  humanIdentity,
  keepStreak,
  openPayment,
  recordHistory,
}: {
  act: (title: string, detail: string) => void;
  aiAvailable: boolean;
  earnPoints: EarnPoints;
  humanIdentity: VerifiedHuman | null;
  keepStreak: (detail?: string) => void;
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
}) {
  const { impact } = useHaptics();
  const [question, setQuestion] = useState("");
  const [selectedMode, setSelectedMode] = useState("Text");
  const [selectedTopic, setSelectedTopic] = useState("Life");
  const [selectedCountryRoute, setSelectedCountryRoute] = useState("World");
  const [activeAskService, setActiveAskService] = useState<"world" | "country">("world");
  const [countryRouteDraft, setCountryRouteDraft] = useState("");
  const [paidCountryRoutes, setPaidCountryRoutes] = useState<string[]>(() =>
    loadJsonFromStorage<string[]>(storageKeys.askCountryRoutes, []),
  );
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [threads, setThreads] = useState(loadStoredAskThreads);

  const [boostedQuestions, setBoostedQuestions] = useState<Set<string>>(new Set());
  const [boostedAnswers, setBoostedAnswers] = useState<Set<string>>(new Set());
  const [unlockedVerdicts, setUnlockedVerdicts] = useState<Set<string>>(
    () => new Set(loadJsonFromStorage<string[]>(storageKeys.unlockedVerdicts, [])),
  );
  const [verdictResults, setVerdictResults] = useState<Record<string, { mostSaid: string; bestAnswer: string; hardTruth: string; finalVerdict: string } | "loading">>({});
  const [helpfulAnswers, setHelpfulAnswers] = useState<Set<string>>(new Set());
  const [countryAnswerUnlocked, setCountryAnswerUnlocked] = useState(() =>
    loadJsonFromStorage<boolean>(storageKeys.countryAnswerUnlocked, false),
  );
  const [anonymousAnswerUnlocked, setAnonymousAnswerUnlocked] = useState(() =>
    loadJsonFromStorage<boolean>(storageKeys.anonymousAnswerUnlocked, false),
  );
  const [askSearch, setAskSearch] = useState("");
  const [askFeedFilter, setAskFeedFilter] = useState("All");
  const [expandedAnswerQuestion, setExpandedAnswerQuestion] = useState<string | null>(null);
  const [showAskAdvanced, setShowAskAdvanced] = useState(false);
  const [expandedWldThread, setExpandedWldThread] = useState<string | null>(null);
  // answer reactions: answerKey → Set of emoji the current user reacted with
  const [answerReactions, setAnswerReactions] = useState<Record<string, Record<string, number>>>(() =>
    loadJsonFromStorage(storageKeys.answerReactions, {}),
  );
  const [myReactions, setMyReactions] = useState<Record<string, string[]>>({});
  // thread bookmarks
  const [savedThreadIds, setSavedThreadIds] = useState<Set<string>>(() =>
    new Set(loadJsonFromStorage<string[]>(storageKeys.savedThreadIds, [])),
  );
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<"question" | string>("question"); // "question" | answerKey
  const recognitionRef = useRef<{ abort: () => void; start: () => void } | null>(null);

  const ANSWER_REACTION_EMOJIS = [
    { emoji: "💡", label: "Real" },
    { emoji: "🔥", label: "Hard truth" },
    { emoji: "❤️", label: "Helped me" },
    { emoji: "🌍", label: "Universal" },
  ];

  const visibleThreads = threads.filter((thread) => {
    if (showSavedOnly && !savedThreadIds.has(thread.question)) return false;
    const targetCountry = getAskThreadTargetCountry(thread);
    const query = askSearch.trim().toLowerCase();
    const matchesQuery = !query || `${thread.question} ${thread.topic} ${thread.author} ${targetCountry}`.toLowerCase().includes(query);
    const matchesFilter =
      askFeedFilter === "All" ||
      thread.topic === askFeedFilter ||
      (askFeedFilter === "Country Route" && targetCountry !== "World") ||
      (askFeedFilter === "Unanswered" && thread.answers.length === 0) ||
      (askFeedFilter === "Answered" && thread.answers.length > 0) ||
      (askFeedFilter === "Yours" && thread.owner);

    return matchesQuery && matchesFilter;
  });
  // Real counts from local thread state — segments the feed by what's
  // actually true right now, not a fixed filter list.
  const unansweredCount = threads.filter((t) => t.answers.length === 0).length;
  const answeredCount = threads.filter((t) => t.answers.length > 0).length;
  const yoursCount = threads.filter((t) => t.owner).length;
  const questionLength = question.trim().length;
  // Coarse label, not a fake-precise percentage — this is a local heuristic
  // (verification + question history), not a network-wide trust metric, so
  // it must not read like one.
  const askerTrustScore = Math.min(
    99,
    24 + (isVerifiedWorldHuman(humanIdentity) ? 26 : 0) + threads.filter((thread) => thread.owner).length * 4,
  );
  const askerTrustLabel =
    askerTrustScore >= 70 ? "Highly trusted" : askerTrustScore >= 45 ? "Trusted asker" : "Building trust";

  useEffect(() => {
    saveJsonToStorage(storageKeys.askThreads, threads);
    compactStorageArray(storageKeys.askThreads, 200);
  }, [threads]);
  useEffect(() => { saveJsonToStorage(storageKeys.answerReactions, answerReactions); }, [answerReactions]);
  useEffect(() => { saveJsonToStorage(storageKeys.savedThreadIds, [...savedThreadIds]); }, [savedThreadIds]);

  useEffect(() => {
    saveJsonToStorage(storageKeys.askCountryRoutes, paidCountryRoutes);
  }, [paidCountryRoutes]);

  function getAskThreadTargetCountry(thread: AskThread) {
    return thread.targetCountry || "World";
  }

  function unlockEnteredCountryRoute() {
    const country = countryRouteDraft.trim().replace(/\s+/g, " ");
    const existingRoute = paidCountryRoutes.find(
      (route) => route.toLowerCase() === country.toLowerCase(),
    );

    if (!country) {
      act("Country required", "Enter the country you want verified humans from before unlocking the route.");
      return;
    }

    if (existingRoute) {
      setSelectedCountryRoute(existingRoute);
      setActiveAskService("country");
      setCountryRouteDraft(existingRoute);
      act(`${existingRoute} selected`, "Your Ask question will track only this selected country route.");
      return;
    }

    openPayment({
      title: `${country} Ask route`,
      amount: "2 WLD",
      detail: `Prioritize and track verified HumanChain answers from ${country} only. Ask The World remains free.`,
      success: `${country} route unlocked for Ask.`,
      feature: "country-answer",
      points: 10,
      onConfirmed: () => {
        setPaidCountryRoutes((current) =>
          current.some((route) => route.toLowerCase() === country.toLowerCase())
            ? current
            : [...current, country],
        );
        setSelectedCountryRoute(country);
        setActiveAskService("country");
        setCountryRouteDraft(country);
      },
    });
  }

  function publishQuestion() {
    if (!requireVerifiedPublicAction(humanIdentity, act, "publishing a public question")) {
      return;
    }

    const targetCountry =
      activeAskService === "country" && selectedCountryRoute !== "World"
        ? selectedCountryRoute
        : "World";
    const cleanQuestion =
      question.trim() || "How do I begin again when life feels heavy?";
    const validation = validateQuestionInput(cleanQuestion, cleanQuestion, selectedTopic, targetCountry);

    if (!validation.ok) {
      act("Question needs work", validation.issues[0] ?? "Adjust the question before publishing.");
      return;
    }

    const threadId = `local-${Date.now()}`;
    setThreads((current) => [
      {
        id: threadId,
        question: cleanQuestion,
        author: humanIdentity?.username ?? "@you",
        owner: true,
        topic: selectedTopic,
        mode: targetCountry === "World" ? selectedMode : `${targetCountry} route`,
        source: "live",
        targetCountry,
        answers: [],
      },
      ...current,
    ]);
    // Persist to Supabase (non-blocking — local state is source of truth).
    // The real DB id (needed so answers can sync) replaces the local
    // placeholder once the insert resolves; local-first behavior is
    // unaffected either way.
    if (humanIdentity?.wallet && humanIdentity.mode === "world") {
      void fetch("/api/db/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion, author_wallet: humanIdentity.wallet, author_username: humanIdentity.username ?? "Human" }),
      })
        .then((res) => res.json())
        .then((data: { thread?: { id?: string } }) => {
          if (!data.thread?.id) return;
          setThreads((current) => current.map((t) => (t.id === threadId ? { ...t, id: data.thread!.id } : t)));
        })
        .catch(() => {/* non-critical */});
    }
    setQuestion("");
    recordHistory({
      title: targetCountry === "World" ? "World question published" : `${targetCountry} question published`,
      detail: `${selectedTopic}: ${cleanQuestion}`,
      kind: "post",
    });
    earnPoints(20, "Useful questions build your future earning score.");
    keepStreak("Your question is live and the Human Verdict is forming.");
  }

  function answerThread(questionText: string) {
    if (!requireVerifiedPublicAction(humanIdentity, act, "answering publicly")) {
      return;
    }

    const draft =
      answerDrafts[questionText]?.trim() ||
      "My honest answer: begin with the smallest action that proves life can still move.";
    const validation = validateAnswerInput(draft);

    if (!validation.ok) {
      act("Answer needs work", validation.issues[0] ?? "Adjust the answer before publishing.");
      return;
    }

    const isAnon = anonymousAnswerUnlocked;
    const answerUser = isAnon ? "@anonymous" : (humanIdentity?.username ?? "@you");
    const answerCountry = countryAnswerUnlocked && selectedCountryRoute !== "World"
      ? selectedCountryRoute
      : "Verified human";

    setThreads((current) =>
      current.map((thread) =>
        thread.question === questionText
          ? {
              ...thread,
              answers: [
                {
                  user: answerUser,
                  country: getAskThreadTargetCountry(thread) !== "World"
                    ? getAskThreadTargetCountry(thread)
                    : answerCountry,
                  text: draft,
                },
                ...thread.answers,
              ],
            }
          : thread,
      ),
    );
    setAnswerDrafts((current) => ({ ...current, [questionText]: "" }));
    // Persist to Supabase so this answer is visible to other users, not just
    // this device — only possible once the parent thread has synced and
    // carries a real DB id (not the local-* placeholder set before the
    // thread's own insert resolves).
    const syncTarget = threads.find((t) => t.question === questionText);
    if (humanIdentity?.wallet && humanIdentity.mode === "world" && syncTarget?.id && !syncTarget.id.startsWith("local-")) {
      void fetch(`/api/db/threads/${syncTarget.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft, author_wallet: humanIdentity.wallet, author_username: answerUser }),
      }).catch(() => {/* non-critical */});
    }
    recordHistory({
      title: isAnon ? "Anonymous answer published" : "Ask answer published",
      detail: draft,
      kind: "comment",
    });
    earnPoints(15, "Your answer helped another verified human.");
    keepStreak("Your answer joined the Human Ask board.");
  }

  function deleteQuestion(questionText: string) {
    setThreads((current) =>
      current.filter((thread) => !(thread.question === questionText && thread.owner)),
    );
    act("Question deleted", "Your Ask post was removed from this device.");
  }

  function startVoice(target: "question" | string) {
    // Stop any active session first
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (voiceListening && voiceTarget === target) {
      setVoiceListening(false);
      return;
    }
    type SpeechRecognitionCtor = new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onstart: (() => void) | null;
      onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      onerror: ((e: { error: string }) => void) | null;
      onend: (() => void) | null;
      abort: () => void;
      start: () => void;
    };
    const w = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : undefined;
    const SR = w
      ? ((w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as SpeechRecognitionCtor | undefined)
      : undefined;
    if (!SR) {
      act("Voice not available", "Your device or browser does not support voice input. Type your question instead.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => { setVoiceListening(true); setVoiceTarget(target); };
    rec.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (!transcript) return;
      if (target === "question") {
        setQuestion((q) => q ? `${q} ${transcript}` : transcript);
      } else {
        setAnswerDrafts((d) => ({ ...d, [target]: d[target] ? `${d[target]} ${transcript}` : transcript }));
      }
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "denied") {
        act("Microphone blocked", "Allow microphone access in your device settings to use voice input.");
      } else if (event.error !== "aborted") {
        act("Voice stopped", "Could not capture audio — tap the mic again to retry.");
      }
    };
    rec.onend = () => { setVoiceListening(false); recognitionRef.current = null; };
    recognitionRef.current = rec;
    try { rec.start(); } catch { act("Voice unavailable", "Tap the mic button again to start voice input."); }
  }

  return (
    <div className="screen ask-screen">
      <section className="aske-composer">
        <div className="aske-composer-head">
          <div>
            <span className="section-kicker">Verified answers</span>
            <h2>Ask clearly. Let real humans answer.</h2>
          </div>
          <button
            aria-pressed={voiceListening && voiceTarget === "question"}
            className={`voice-orb${voiceListening && voiceTarget === "question" ? " listening" : ""}`}
            onClick={() => startVoice("question")}
            title={voiceListening && voiceTarget === "question" ? "Tap to stop recording" : "Tap to ask with your voice"}
            type="button"
          >
            <Mic size={24} />
          </button>
        </div>
        <div className="ask-service-switch" aria-label="Ask service path">
          <button
            aria-pressed={activeAskService === "world"}
            className={`ask-service-primary${activeAskService === "world" ? " active" : ""}`}
            onClick={() => {
              setActiveAskService("world");
              setSelectedCountryRoute("World");
              act("Ask The World", "Your question will be free and open to all verified humans.");
            }}
            type="button"
          >
            <span>Free</span>
            <strong>Public</strong>
            <small>Open to all verified humans — no bot answers</small>
          </button>
          <button
            aria-pressed={activeAskService === "country"}
            className={`ask-route-chip${activeAskService === "country" ? " active" : ""}`}
            onClick={() => {
              setActiveAskService("country");
              act("Country route", "Enter one country and unlock exact country tracking for 2 WLD.");
            }}
            type="button"
          >
            <Radio size={12} />
            <span>
              {selectedCountryRoute === "World"
                ? "Country Route — ask one country"
                : `Tracking ${selectedCountryRoute}`}
            </span>
            <small>2 WLD</small>
          </button>
        </div>
        {activeAskService === "country" ? (
          <div className="ask-route-panel">
            <div>
              <strong>Choose the exact country</strong>
              <span>
                Enter the country you want to ask. After the World App payment,
                this question tracks that country only.
              </span>
            </div>
            <div className="ask-route-control">
              <input
                aria-label="Country to ask"
                onChange={(event) => setCountryRouteDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    unlockEnteredCountryRoute();
                  }
                }}
                placeholder="Country, e.g. Kenya"
                value={countryRouteDraft}
              />
              <button onClick={unlockEnteredCountryRoute} type="button">
                Unlock route - 2 WLD
              </button>
            </div>
            <div className="ask-route-status">
              {paidCountryRoutes.length ? (
                <>
                  <span className="ask-route-status-label">Your countries</span>
                  {paidCountryRoutes.map((country) => (
                    <button
                      aria-pressed={selectedCountryRoute === country}
                      className={selectedCountryRoute === country ? "active" : ""}
                      key={country}
                      onClick={() => {
                        setSelectedCountryRoute(country);
                        setActiveAskService("country");
                        act(`${country} selected`, "Your Ask question will track only this selected country route.");
                      }}
                      type="button"
                    >
                      {country}
                    </button>
                  ))}
                </>
              ) : (
                <span>No country unlocked yet — unlock one above</span>
              )}
            </div>
            {selectedCountryRoute !== "World" ? (
              <small className="ask-route-current">
                Tracking: {selectedCountryRoute} only
              </small>
            ) : null}
          </div>
        ) : null}

        <label htmlFor="question">What do you want to ask humanity?</label>
        <textarea
          id="question"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: Should I leave my job and start my own business?"
          value={question}
        />
        <div className="field-helper-row">
          <span>{questionLength}/280 characters</span>
          <span>Asker trust: {askerTrustLabel}</span>
        </div>
        <button
          aria-expanded={showAskAdvanced}
          className="ask-advanced-toggle"
          onClick={() => setShowAskAdvanced((current) => !current)}
          type="button"
        >
          {showAskAdvanced ? "Hide paid options" : "Open paid options"}
        </button>
        {showAskAdvanced ? (
          <div className="ask-modes">
            {[
              ["Text", "Public question", "Free"],
              ["Voice", "Voice input", "Free"],
              ["Private", "Hide identity", "4 WLD"],
              ["Deep Verdict", "Human report", "6 WLD"],
            ].map(([mode, label, amount]) => (
              <button
                aria-pressed={selectedMode === mode}
                className={selectedMode === mode ? "active" : ""}
                key={mode}
                onClick={() => {
                  if (mode === "Text") {
                    setSelectedMode("Text");
                    act("Text mode", "Public question selected. No payment needed.");
                    return;
                  }

                  if (mode === "Voice") {
                    setSelectedMode("Voice");
                    startVoice("question");
                    return;
                  }

                  openPayment({
                    title: `${mode} question`,
                    amount,
                    detail:
                      mode === "Private"
                        ? "Hide your public identity while verified humans answer."
                        : "Turn answers into most-said, best answer, country differences, hard truth, and final verdict.",
                    success: `${mode} mode is now active. Your next question will use this flow.`,
                    feature:
                      mode === "Private"
                        ? "private-question"
                        : "deep-verdict-question",
                    points: mode === "Deep Verdict" ? 12 : 6,
                    onConfirmed: () => {
                      setSelectedMode(mode);
                      act(`${mode} mode unlocked`, `Your next question will publish as a ${mode} ask.`);
                    },
                  });
                }}
                type="button"
              >
                <strong>{mode}</strong>
                <span>{label}</span>
                {amount !== "Free" && <small className="ask-mode-price"><LockKeyhole size={10} />{amount}</small>}
              </button>
            ))}
          </div>
        ) : null}
        <div className="chip-row">
          {["Life", "Money", "Business", "Family", "Love", "Culture"].map((chip) => (
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
        <Haptic variant="impact" type="medium" asChild>
          <Button
            variant="primary"
            fullWidth
            disabled={!question.trim()}
            onClick={() => {
              impact("medium");
              if (activeAskService === "country" && selectedCountryRoute === "World") {
                unlockEnteredCountryRoute();
                return;
              }
              publishQuestion();
            }}
            type="button"
          >
            <Send size={18} />
            {activeAskService === "country"
              ? selectedCountryRoute === "World"
                ? "Unlock country route"
                : `Ask ${selectedCountryRoute}`
              : "Ask Verified Humans"}
          </Button>
        </Haptic>
      </section>

      <section className="ask-board">
        <div className="section-heading">
          <span>Questions</span>
          <MessageCircleQuestion size={18} />
        </div>
        <div className="ask-discovery-bar">
          <div className="search-field">
            <Search size={16} />
            <input
              aria-label="Search questions"
              onChange={(event) => setAskSearch(event.target.value)}
              placeholder="Search questions, topics, or countries"
              value={askSearch}
            />
          </div>
          <div className="aske-segments" role="tablist" aria-label="Filter by status">
            {[
              { key: "All", label: "All", count: threads.length },
              { key: "Unanswered", label: "Unanswered", count: unansweredCount },
              { key: "Answered", label: "Answered", count: answeredCount },
              { key: "Yours", label: "Yours", count: yoursCount },
            ].map((seg) => (
              <button
                aria-pressed={askFeedFilter === seg.key}
                className={`aske-segment${askFeedFilter === seg.key ? " active" : ""}`}
                key={seg.key}
                onClick={() => { setAskFeedFilter(seg.key); setShowSavedOnly(false); }}
                type="button"
              >
                {seg.label}
                <span>{seg.count}</span>
              </button>
            ))}
          </div>
          <div className="chip-row compact">
            {["Life", "Money", "Business", "Family", "Love", "Culture", "Country Route"].map((filter) => (
              <button
                aria-pressed={askFeedFilter === filter}
                className={askFeedFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => { setAskFeedFilter(filter); setShowSavedOnly(false); }}
                type="button"
              >
                {filter}
              </button>
            ))}
            <button
              aria-pressed={showSavedOnly}
              className={showSavedOnly ? "active" : ""}
              onClick={() => setShowSavedOnly((v) => !v)}
              type="button"
            >
              ★ Saved{savedThreadIds.size > 0 ? ` (${savedThreadIds.size})` : ""}
            </button>
          </div>
        </div>
        {visibleThreads.length ? visibleThreads.map((thread, index) => {
          const targetCountry = getAskThreadTargetCountry(thread);
          const visibleAnswers =
            targetCountry === "World"
              ? thread.answers
              : thread.answers.filter((answer) => answer.country === targetCountry);

          const verdictUnlocked = unlockedVerdicts.has(thread.question);
          const alreadyAnswered = thread.answers.some((a) => a.user === (humanIdentity?.username ?? "@you") || a.user === "@anonymous");

          return (
          <article
            className={`ask-thread${expandedAnswerQuestion === thread.question ? " ask-thread--expanded" : " ask-thread--dense"}`}
            key={`${thread.question}-${index}`}
          >
            <div className="ask-thread-top">
              <span>{thread.topic} · {thread.author}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {isDemoItem(thread) && <DataBadge label="Demo" />}
                <small>{targetCountry === "World" ? thread.mode : `${targetCountry} route`}{boostedQuestions.has(thread.question) ? " · 🔥" : ""}{verdictUnlocked ? " · ✓ Verdict" : ""}</small>
                {alreadyAnswered && <span className="ask-answered-badge">✓ Answered</span>}
                <button
                  className={`ask-bookmark-btn${savedThreadIds.has(thread.question) ? " active" : ""}`}
                  onClick={() => setSavedThreadIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(thread.question)) { next.delete(thread.question); } else { next.add(thread.question); }
                    return next;
                  })}
                  title={savedThreadIds.has(thread.question) ? "Remove bookmark" : "Bookmark question"}
                  type="button"
                >
                  {savedThreadIds.has(thread.question) ? "★" : "☆"}
                </button>
              </div>
            </div>
            <h3>{thread.question}</h3>
            {verdictUnlocked && visibleAnswers.length > 0 ? (
              <div className="ask-verdict-panel">
                <span className="section-kicker">Deep Verdict</span>
                {(() => {
                  const vr = verdictResults[thread.question];
                  if (vr === "loading") {
                    return <p style={{ opacity: 0.6, fontSize: "0.85rem", padding: "8px 0" }}>Generating verdict…</p>;
                  }
                  if (vr && typeof vr === "object") {
                    return (
                      <>
                        <div className="ask-verdict-row"><strong>Most said</strong><p>{vr.mostSaid}</p></div>
                        <div className="ask-verdict-row"><strong>Best answer</strong><p>{vr.bestAnswer}</p></div>
                        <div className="ask-verdict-row"><strong>Hard truth</strong><p>{vr.hardTruth}</p></div>
                        <div className="ask-verdict-row"><strong>Final verdict</strong><p>{vr.finalVerdict}</p></div>
                        <div className="ask-verdict-row"><strong>Answer count</strong><p>{visibleAnswers.length} verified human{visibleAnswers.length === 1 ? "" : "s"} responded</p></div>
                      </>
                    );
                  }
                  return (
                    <>
                      <div className="ask-verdict-row"><strong>Most said</strong><p>{visibleAnswers[0]?.text ?? "Collecting answers…"}</p></div>
                      <div className="ask-verdict-row"><strong>Best answer</strong><p>{visibleAnswers.reduce((a, b) => a.text.length > b.text.length ? a : b, visibleAnswers[0])?.text ?? "—"}</p></div>
                      <div className="ask-verdict-row"><strong>Answer count</strong><p>{visibleAnswers.length} verified human{visibleAnswers.length === 1 ? "" : "s"} responded</p></div>
                      <div className="ask-verdict-row"><strong>Hard truth</strong><p>Real answers from verified humans carry more weight than public opinion.</p></div>
                      <div className="ask-verdict-row"><strong>Final verdict</strong><p>Read all answers above — the truth is in the patterns, not one reply.</p></div>
                      <button
                        style={{ marginTop: 8, fontSize: "0.78rem", opacity: 0.7 }}
                        onClick={async () => {
                          const q = thread.question;
                          const answersForVerdict = visibleAnswers.map((a) => ({ text: a.text, country: (a as { country?: string }).country }));
                          setVerdictResults((prev) => ({ ...prev, [q]: "loading" }));
                          try {
                            const res = await fetch("/api/ai/verdict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, answers: answersForVerdict, feature: "deep-verdict" }) });
                            const data = await res.json() as { ok?: boolean; verdict?: { mostSaid: string; bestAnswer: string; hardTruth: string; finalVerdict: string } };
                            if (data.ok && data.verdict) { setVerdictResults((prev) => ({ ...prev, [q]: data.verdict! })); }
                            else { setVerdictResults((prev) => { const next = { ...prev }; delete next[q]; return next; }); act("Retry failed", "AI unavailable — try again later."); }
                          } catch { setVerdictResults((prev) => { const next = { ...prev }; delete next[q]; return next; }); act("Retry failed", "Connection issue."); }
                        }}
                        type="button"
                      >↺ Reload AI verdict</button>
                    </>
                  );
                })()}
              </div>
            ) : null}
            {targetCountry !== "World" ? (
              <div className="ask-country-lock">
                <strong>{targetCountry}</strong>
                <span>Only {targetCountry}-routed answers are tracked on this question.</span>
              </div>
            ) : null}
            {/* Real answer count, shown plainly — no synthetic "quality %" bar. */}
            <p className="ask-answer-count">{visibleAnswers.length} tracked answer{visibleAnswers.length === 1 ? "" : "s"}</p>
            <button
              className="answer-reveal-button"
              onClick={() =>
                setExpandedAnswerQuestion((current) =>
                  current === thread.question ? null : thread.question,
                )
              }
              type="button"
            >
              {expandedAnswerQuestion === thread.question
                ? "Hide answers"
                : `Read answers (${visibleAnswers.length})`}
            </button>
            {expandedAnswerQuestion === thread.question ? (
              <div className="answer-stack">
              {visibleAnswers.length ? visibleAnswers.map((answer) => (
                <div className="answer-card" key={`${thread.question}-${answer.user}-${answer.text}`}>
                  <strong>{answer.user} - {answer.country}</strong>
                  <small>Verified responder - helpful signal visible</small>
                  <p>{answer.text}</p>
                  <div className="answer-reactions">
                    {ANSWER_REACTION_EMOJIS.map(({ emoji, label }) => {
                      const ak = `${thread.question}|${answer.user}|${answer.text}`;
                      const count = answerReactions[ak]?.[emoji] ?? 0;
                      const reacted = myReactions[ak]?.includes(emoji) ?? false;
                      return (
                        <button
                          key={emoji}
                          className={`answer-reaction-btn${reacted ? " reacted" : ""}`}
                          onClick={() => {
                            if (reacted) return;
                            setMyReactions((prev) => ({ ...prev, [ak]: [...(prev[ak] ?? []), emoji] }));
                            setAnswerReactions((prev) => ({
                              ...prev,
                              [ak]: { ...(prev[ak] ?? {}), [emoji]: (prev[ak]?.[emoji] ?? 0) + 1 },
                            }));
                          }}
                          title={label}
                          type="button"
                        >
                          {emoji}{count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="trust-action-row">
                    {(() => {
                      const ak = `${thread.question}|${answer.user}|${answer.text}`;
                      const isHelpful = helpfulAnswers.has(ak);
                      return (
                        <>
                          <button
                            className={isHelpful ? "active" : ""}
                            disabled={isHelpful}
                            onClick={() => {
                              if (isHelpful) return;
                              setHelpfulAnswers((p) => new Set([...p, ak]));
                              earnPoints(2, "Helpful signal strengthens the human verdict.");
                              act("Marked helpful", "Your signal improves verdict quality for this question.");
                            }}
                            type="button"
                          >
                            {isHelpful ? "✓ Helpful" : "Helpful"}
                          </button>
                          <ReportAction
                            className="answer-report-action"
                            onReported={(reason) => act("Report submitted", `"${reason}" report sent to moderation.`)}
                            reporterWallet={humanIdentity?.wallet}
                            targetId={ak}
                            targetType="ask-answer"
                          />
                        </>
                      );
                    })()}
                    {answer.user === (humanIdentity?.username ?? "@you") ? (
                      (() => {
                        const answerKey = `${thread.question}|${answer.user}|${answer.text}`;
                        const alreadyBoosted = boostedAnswers.has(answerKey);
                        return (
                          <button
                            className={`answer-boost-btn${alreadyBoosted ? " active" : ""}`}
                            disabled={alreadyBoosted}
                            onClick={() => {
                              if (alreadyBoosted) return;
                              openPayment({
                                title: "Boost this answer to top",
                                amount: "0.5 WLD",
                                detail: "Your answer moves to the top of this thread for 24 hours.",
                                success: "Answer boosted — it now appears first in this thread.",
                                feature: "quick-answer-boost",
                                points: 8,
                                onConfirmed: async () => {
                                  setBoostedAnswers((prev) => new Set([...prev, answerKey]));
                                  setThreads((current) => current.map((t) =>
                                    t.question === thread.question
                                      ? { ...t, answers: [answer, ...t.answers.filter((a) => a !== answer)] }
                                      : t,
                                  ));
                                },
                              });
                            }}
                            type="button"
                          >
                            {alreadyBoosted ? "↑ Boosted" : "↑ Boost · 0.5 WLD"}
                          </button>
                        );
                      })()
                    ) : null}
                  </div>
                </div>
              )) : (
                <div className="answer-card waiting">
                  <strong>Waiting for verified humans</strong>
                  <p>
                    {targetCountry === "World"
                      ? "No automatic answer is added. The first response must come from a real HumanChain user."
                      : `No ${targetCountry}-routed answer is recorded yet. Other countries are not counted here.`}
                  </p>
                </div>
              )}
            </div>
            ) : null}
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
            {(anonymousAnswerUnlocked || (countryAnswerUnlocked && selectedCountryRoute !== "World")) && (
              <div className="ask-answer-mode-badges">
                {anonymousAnswerUnlocked && <span className="ask-mode-badge anon">🔒 Anonymous mode</span>}
                {countryAnswerUnlocked && selectedCountryRoute !== "World" && <span className="ask-mode-badge country">📍 {selectedCountryRoute} mode</span>}
              </div>
            )}
            <div className="thread-actions">
              <button onClick={() => answerThread(thread.question)} type="button">
                Answer
              </button>
              {thread.owner ? (
                <button
                  className="danger"
                  onClick={() => deleteQuestion(thread.question)}
                  type="button"
                >
                  Delete
                </button>
              ) : null}
              <button
                className={`thread-premium-toggle${expandedWldThread === thread.question ? " open" : ""}${boostedQuestions.has(thread.question) || unlockedVerdicts.has(thread.question) ? " has-active" : ""}`}
                onClick={() => setExpandedWldThread((v) => v === thread.question ? null : thread.question)}
                type="button"
              >
                {boostedQuestions.has(thread.question) || unlockedVerdicts.has(thread.question) ? "WLD ✓" : "WLD ⋯"}
              </button>
            </div>
            {expandedWldThread === thread.question ? (
              <div className="thread-wld-row">
                <button
                  className={boostedQuestions.has(thread.question) ? "active" : ""}
                  onClick={() =>
                    openPayment({
                      title: "Boost question",
                      amount: "2 WLD",
                      detail: "Move this question to the top of the board so more verified humans answer it today.",
                      success: "Question boosted to the top of the board for 24 hours.",
                      feature: "boost-question",
                      points: 8,
                      onConfirmed: () => {
                        setBoostedQuestions((prev) => new Set([...prev, thread.question]));
                        setThreads((current) => {
                          const target = current.find((t) => t.question === thread.question);
                          if (!target) return current;
                          return [target, ...current.filter((t) => t.question !== thread.question)];
                        });
                        recordHistory({ title: "Question boosted", detail: thread.question, kind: "post" });
                      },
                    })
                  }
                  type="button"
                >
                  {boostedQuestions.has(thread.question) ? "✓ Boosted" : "↑ Boost · 2 WLD"}
                </button>
                <button
                  className={unlockedVerdicts.has(thread.question) ? "active" : ""}
                  disabled={!aiAvailable && !unlockedVerdicts.has(thread.question)}
                  onClick={() => {
                    if (!aiAvailable && !unlockedVerdicts.has(thread.question)) {
                      act("AI setup pending", "Deep Verdict needs the AI backend configured before it can be unlocked. Nothing was charged.");
                      return;
                    }
                    if (unlockedVerdicts.has(thread.question)) {
                      act("Verdict ready", "Your Deep Verdict is already unlocked for this question.");
                      return;
                    }
                    openPayment({
                      title: "Deep Verdict",
                      amount: "6 WLD",
                      detail: "Turn this question's answers into a structured human report: most said, best answer, country differences, hard truth, final verdict.",
                      success: "Deep Verdict unlocked. Scroll up to see the full human report.",
                      feature: "deep-verdict",
                      points: 12,
                      onConfirmed: async () => {
                        const q = thread.question;
                        setUnlockedVerdicts((prev) => {
                          const next = new Set([...prev, q]);
                          saveJsonToStorage(storageKeys.unlockedVerdicts, [...next]);
                          return next;
                        });
                        recordHistory({ title: "Deep Verdict unlocked", detail: q, kind: "post" });
                        const answersForVerdict = visibleAnswers.map((a) => ({ text: a.text, country: (a as { country?: string }).country }));
                        setVerdictResults((prev) => ({ ...prev, [q]: "loading" }));
                        try {
                          const res = await fetch("/api/ai/verdict", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ question: q, answers: answersForVerdict, feature: "deep-verdict" }),
                          });
                          const data = await res.json() as { ok?: boolean; verdict?: { mostSaid: string; bestAnswer: string; hardTruth: string; finalVerdict: string } };
                          if (data.ok && data.verdict) {
                            setVerdictResults((prev) => ({ ...prev, [q]: data.verdict! }));
                          } else {
                            setVerdictResults((prev) => { const next = { ...prev }; delete next[q]; return next; });
                            act("Verdict loading failed", "AI unavailable — your unlock is saved. Reopen this question to retry.");
                          }
                        } catch {
                          setVerdictResults((prev) => { const next = { ...prev }; delete next[q]; return next; });
                          act("Verdict loading failed", "Connection issue — your unlock is saved. Reopen this question to retry.");
                        }
                      },
                    });
                  }}
                  type="button"
                >
                  {unlockedVerdicts.has(thread.question)
                    ? "✓ Verdict live"
                    : aiAvailable
                      ? <><LockKeyhole size={11} /> Verdict · 6 WLD</>
                      : <><LockKeyhole size={11} /> AI setup pending</>}
                </button>
              </div>
            ) : null}
            </article>
          );
        }) : (
            <div className="empty-feed-state">
              <strong>No matching questions</strong>
              <span>Clear search or choose another topic to keep browsing.</span>
            </div>
          )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>People also asked</span>
          <PenLine size={18} />
        </div>
        {answerQueue.slice(0, 3).map((prompt) => (
          <article className="question-row ask-paa-row" key={prompt}>
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
            className={voiceListening && voiceTarget !== "question" ? "active" : ""}
            disabled={threads.length === 0}
            onClick={() => {
              const activeThread = threads.find((t) => t.answers.length === 0 || expandedAnswerQuestion === t.question);
              const key = activeThread?.question ?? threads[0]?.question ?? "voice";
              startVoice(key);
            }}
            type="button"
            title={voiceListening && voiceTarget !== "question" ? "Tap to stop recording" : "Tap mic to dictate your answer"}
          >
            <Mic size={14} />
            {voiceListening && voiceTarget !== "question" ? "Listening…" : "Voice answer"}
          </button>
          <button
            className={countryAnswerUnlocked ? "active" : ""}
            onClick={() => {
              if (countryAnswerUnlocked) {
                act("Country answer active", "Your next answer will carry your country and culture signal.");
                return;
              }
              openPayment({
                title: "Country & Culture Answer",
                amount: "1 WLD",
                detail: "Answer as your country sees it. Your answer is labelled with your verified region — adds weight to country-routed questions.",
                success: "Country answer mode active. Your next answer carries your region signal.",
                feature: "country-answer-mode",
                points: 8,
                onConfirmed: async () => {
                  setCountryAnswerUnlocked(true);
                  saveJsonToStorage(storageKeys.countryAnswerUnlocked, true);
                  recordHistory({ title: "Country answer unlocked", detail: "1 WLD. Country-labelled answers now active.", kind: "post" });
                },
              });
            }}
            type="button"
          >
            {countryAnswerUnlocked ? "✓ Country answer active" : "Country and culture answer · 1 WLD"}
          </button>
          <button
            className={anonymousAnswerUnlocked ? "active" : ""}
            onClick={() => {
              if (anonymousAnswerUnlocked) {
                act("Anonymous mode active", "Your identity stays private on your next answer.");
                return;
              }
              openPayment({
                title: "Anonymous Verified Answer",
                amount: "1.5 WLD",
                detail: "Answer without revealing your username. World ID still verifies you're human — only your name stays private.",
                success: "Anonymous mode active. Your next answer will be published without your username.",
                feature: "anonymous-answer",
                points: 6,
                onConfirmed: async () => {
                  setAnonymousAnswerUnlocked(true);
                  saveJsonToStorage(storageKeys.anonymousAnswerUnlocked, true);
                  recordHistory({ title: "Anonymous answer unlocked", detail: "1.5 WLD. Anonymous verified answers now active.", kind: "post" });
                },
              });
            }}
            type="button"
          >
            {anonymousAnswerUnlocked ? "✓ Anonymous mode active" : "Anonymous verified answer · 1.5 WLD"}
          </button>
        </div>
      </section>
    </div>
  );
}
