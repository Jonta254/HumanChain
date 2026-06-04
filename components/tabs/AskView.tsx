"use client";

import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  MapPin,
  MessageCircleQuestion,
  Mic,
  PenLine,
  Radio,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  validateAnswerInput,
  validateQuestionInput,
} from "@/lib/humanchainPolicy";
import {
  loadJsonFromStorage,
  saveJsonToStorage,
  storageKeys,
} from "@/lib/humanchain/storage";
import {
  isVerifiedWorldHuman,
  requireVerifiedPublicAction,
} from "@/lib/humanchain/utils";
import { Meter } from "@/components/ui/Meter";
import { TopBar } from "@/components/layout/TopBar";
import type { AskThread } from "@/types/chain";
import type { EarnPoints, OpenPayment } from "@/types/ui";
import type { HistoryRecord } from "@/types/reputation";
import type { VerifiedHuman } from "@/types/user";

const wldActions = [
  ["tip", "Tip, Golden Link, or streak restore"],
  ["pin", "Pin a link or unlock story pages"],
  ["country", "Ask one country or save a capsule"],
  ["private", "Ask privately as a verified human"],
  ["voice", "Request voice answers"],
  ["verdict", "Unlock Deep Human Verdict"],
];

const answerQueue = [
  "What helped you keep going when nobody saw you struggling?",
  "What belief from your culture made you stronger?",
  "What should a young person know before chasing money?",
  "What is one truth about love people learn too late?",
];

const worldVerdictParts = [
  "What most humans said",
  "Best answer",
  "Country differences",
  "Hard truth",
  "Final verdict",
];

const starterAskThreads: AskThread[] = [
  {
    question: "How do I start again after losing confidence?",
    author: "@humanchain",
    owner: false,
    topic: "Life",
    mode: "Text",
    targetCountry: "World",
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
    author: "@humanchain",
    owner: false,
    topic: "Money",
    mode: "Country",
    targetCountry: "World",
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

function loadStoredAskThreads(): AskThread[] {
  if (typeof window === "undefined") {
    return starterAskThreads;
  }

  return loadJsonFromStorage<Partial<AskThread>[]>(storageKeys.askThreads, starterAskThreads).map(
    (thread) => ({
      answers: thread.answers ?? [],
      author: thread.author ?? "@humanchain",
      mode: thread.mode ?? "Text",
      owner: Boolean(thread.owner),
      question: thread.question ?? "Untitled question",
      targetCountry: thread.targetCountry ?? "World",
      topic: thread.topic ?? "Life",
    }),
  );
}

export function AskView({
  act,
  earnPoints,
  humanIdentity,
  keepStreak,
  openPayment,
  recordHistory,
}: {
  act: (title: string, detail: string) => void;
  earnPoints: EarnPoints;
  humanIdentity: VerifiedHuman | null;
  keepStreak: (detail?: string) => void;
  openPayment: OpenPayment;
  recordHistory: (record: Omit<HistoryRecord, "id" | "time">) => void;
}) {
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
  const [voiceMode, setVoiceMode] = useState(false);
  const [askSearch, setAskSearch] = useState("");
  const [askFeedFilter, setAskFeedFilter] = useState("All");
  const [expandedAnswerQuestion, setExpandedAnswerQuestion] = useState<string | null>(null);
  const [showAskAdvanced, setShowAskAdvanced] = useState(false);

  const visibleThreads = threads.filter((thread) => {
    const targetCountry = getAskThreadTargetCountry(thread);
    const query = askSearch.trim().toLowerCase();
    const matchesQuery = !query || `${thread.question} ${thread.topic} ${thread.author} ${targetCountry}`.toLowerCase().includes(query);
    const matchesFilter =
      askFeedFilter === "All" ||
      thread.topic === askFeedFilter ||
      (askFeedFilter === "Country Route" && targetCountry !== "World") ||
      (askFeedFilter === "Unanswered" && thread.answers.length === 0);

    return matchesQuery && matchesFilter;
  });
  const questionLength = question.trim().length;
  const askerTrustScore = Math.min(
    99,
    24 + (isVerifiedWorldHuman(humanIdentity) ? 26 : 0) + threads.filter((thread) => thread.owner).length * 4,
  );

  useEffect(() => {
    saveJsonToStorage(storageKeys.askThreads, threads);
  }, [threads]);

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

    setThreads((current) => [
      {
        question: cleanQuestion,
        author: humanIdentity?.username ?? "@you",
        owner: true,
        topic: selectedTopic,
        mode: targetCountry === "World" ? selectedMode : `${targetCountry} route`,
        targetCountry,
        answers: [],
      },
      ...current,
    ]);
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

    setThreads((current) =>
      current.map((thread) =>
        thread.question === questionText
          ? {
              ...thread,
              answers: [
                {
                  user: humanIdentity?.username ?? "@you",
                  country:
                    getAskThreadTargetCountry(thread) === "World"
                      ? "Verified human"
                      : getAskThreadTargetCountry(thread),
                  text: draft,
                },
                ...thread.answers,
              ],
            }
          : thread,
      ),
    );
    setAnswerDrafts((current) => ({ ...current, [questionText]: "" }));
    recordHistory({
      title: "Ask answer published",
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

  return (
    <div className="screen">
      <TopBar title="Ask The World" subtitle="Ask one honest question. Verified humans answer." />
      <section className="ask-hero">
        <div>
          <span className="section-kicker">Verified answers</span>
          <h2>Ask clearly. Let real humans answer.</h2>
          <p>
            Ask verified humans. Open paid routes only when you need them.
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
        <div className="ask-service-switch" aria-label="Ask service path">
          <button
            aria-pressed={activeAskService === "world"}
            className={activeAskService === "world" ? "active" : ""}
            onClick={() => {
              setActiveAskService("world");
              setSelectedCountryRoute("World");
              act("Ask The World", "Your question will be free and open to all verified humans.");
            }}
            type="button"
          >
            <span>Free</span>
            <strong>Public</strong>
            <small>Open to all verified humans</small>
          </button>
          <button
            aria-pressed={activeAskService === "country"}
            className={activeAskService === "country" ? "active" : ""}
            onClick={() => {
              setActiveAskService("country");
              act("Country route", "Enter one country and unlock exact country tracking for 2 WLD.");
            }}
            type="button"
          >
            <span>2 WLD</span>
            <strong>Country Route</strong>
            <small>
              {selectedCountryRoute === "World"
                ? "Ask one selected country"
                : `Tracking ${selectedCountryRoute}`}
            </small>
          </button>
        </div>
        <div className="ask-benefit-row">
          <span>
            <ShieldCheck size={14} />
            Free: all verified humans
          </span>
          <span>
            <MapPin size={14} />
            2 WLD: one country route
          </span>
          <span>
            <Radio size={14} />
            Estimate: first reply in 10 min
          </span>
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
              {paidCountryRoutes.length ? paidCountryRoutes.map((country) => (
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
              )) : (
                <span>No country route unlocked yet</span>
              )}
            </div>
            <small className="ask-route-current">
              Tracking: {selectedCountryRoute === "World" ? "country route not unlocked" : `${selectedCountryRoute} only`}
            </small>
          </div>
        ) : (
          <div className="ask-world-note">
            <strong>World free path</strong>
            <span>Publishes to all verified humans. No bot answer is inserted.</span>
          </div>
        )}

        <label htmlFor="question">What do you want to ask humanity?</label>
        <textarea
          id="question"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: Should I leave my job and start my own business?"
          value={question}
        />
        <div className="field-helper-row">
          <span>{questionLength}/280 characters</span>
          <span>Asker trust score: {askerTrustScore}</span>
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
                    feature:
                      mode === "Voice"
                        ? "voice-question"
                        : mode === "Private"
                          ? "private-question"
                          : "deep-verdict-question",
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
        <button
          className="primary-command"
          disabled={!question.trim()}
          onClick={() => {
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
        </button>
      </section>

      <section className="ask-board">
        <div className="section-heading">
          <span>Live Human Questions</span>
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
          <div className="chip-row compact">
            {["All", "Life", "Money", "Business", "Country Route", "Unanswered"].map((filter) => (
              <button
                aria-pressed={askFeedFilter === filter}
                className={askFeedFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => setAskFeedFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        {visibleThreads.length ? visibleThreads.map((thread, index) => {
          const targetCountry = getAskThreadTargetCountry(thread);
          const visibleAnswers =
            targetCountry === "World"
              ? thread.answers
              : thread.answers.filter((answer) => answer.country === targetCountry);

          return (
          <article className="ask-thread" key={`${thread.question}-${index}`}>
            <div className="ask-thread-top">
              <span>{thread.topic} - {thread.author}</span>
              <small>Trust {askerTrustScore} - {targetCountry === "World" ? thread.mode : targetCountry} route</small>
            </div>
            <h3>{thread.question}</h3>
            {targetCountry !== "World" ? (
              <div className="ask-country-lock">
                <strong>{targetCountry}</strong>
                <span>Only {targetCountry}-routed answers are tracked on this question.</span>
              </div>
            ) : null}
            <Meter label={`${visibleAnswers.length} tracked answer${visibleAnswers.length === 1 ? "" : "s"}`} value={Math.min(92, 22 + visibleAnswers.length * 18)} />
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
                  <div className="trust-action-row">
                    <button onClick={() => act("Helpful signal", "This answer was marked helpful for verdict ranking.")} type="button">
                      Helpful
                    </button>
                    <button onClick={() => act("Report queued", "Choose a report reason before moderator review.")} type="button">
                      Report
                    </button>
                    {answer.user === (humanIdentity?.username ?? "@you") ? (
                      <button
                        className="answer-boost-btn"
                        onClick={() => openPayment({
                          title: "Boost this answer to top",
                          amount: "0.5",
                          detail: "Your answer moves to the top of this thread for 24 hours. Verified humans see it first.",
                          success: "Answer boosted to top of thread for 24 hours.",
                          feature: "quick-answer-boost",
                          points: 8,
                        })}
                        type="button"
                      >
                        ↑ Boost · 0.5 WLD
                      </button>
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
            );
          }) : (
            <div className="empty-feed-state">
              <strong>No matching questions</strong>
              <span>Clear search or choose another topic to keep browsing.</span>
            </div>
          )}
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
