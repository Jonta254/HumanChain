"use client";

import { useEffect } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

// ── Shared inner components ───────────────────────────────────────────────────

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="legal-section">
      <h2 className="legal-h2">{title}</h2>
      {children}
    </section>
  );
}

function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="legal-p">{children}</p>;
}

function LegalUl({ items }: { items: string[] }) {
  return (
    <ul className="legal-ul">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

// ── Terms of Use ──────────────────────────────────────────────────────────────

function TermsContent() {
  return (
    <>
      <LegalP>
        Effective date: June 25, 2026. Last updated: June 25, 2026.
      </LegalP>
      <LegalP>
        Welcome to HumanChain. By accessing or using this mini app (&quot;HumanChain&quot;, &quot;the App&quot;,
        &quot;the Service&quot;) you agree to these Terms of Use (&quot;Terms&quot;). If you do not agree, do not
        use the App.
      </LegalP>

      <LegalSection title="1. Who can use HumanChain">
        <LegalP>
          You must be at least 18 years old (or the age of legal majority in your jurisdiction)
          to use HumanChain. By using the App you represent that you meet this requirement.
          HumanChain requires a verified World ID to access core features. You are responsible
          for maintaining the security of your World App wallet.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. What HumanChain is">
        <LegalP>
          HumanChain is a verified human social network operating as a World App mini app.
          It allows verified humans to ask questions, post moments, trade items nearby, read
          and publish stories, and build a Human Passport (reputation profile). All core features
          require World ID verification to prevent bots and duplicate accounts.
        </LegalP>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <LegalP>You agree that you will not:</LegalP>
        <LegalUl items={[
          "Post content that is illegal, harmful, abusive, harassing, defamatory, obscene, or fraudulent.",
          "Impersonate any person or entity or misrepresent your affiliation with any person or entity.",
          "Attempt to bypass World ID verification or submit fraudulent proofs.",
          "Use automated bots, scripts, or scrapers to interact with the App.",
          "Post spam, pyramid schemes, phishing links, or deceptive marketplace listings.",
          "Upload malware or any code that could harm the App or its users.",
          "Attempt to gain unauthorised access to HumanChain systems or other users' data.",
          "Use the App for money laundering, fraud, or any other illegal financial activity.",
          "Violate any applicable local, national, or international law or regulation.",
        ]} />
        <LegalP>
          HumanChain reserves the right to remove content and suspend or terminate accounts
          that violate these Terms, at its sole discretion and without prior notice.
        </LegalP>
      </LegalSection>

      <LegalSection title="4. User content">
        <LegalP>
          You retain ownership of content you post. By posting content on HumanChain you grant
          HumanChain a worldwide, non-exclusive, royalty-free licence to display, store, and
          distribute that content within the Service for the purpose of operating the App.
          This licence ends when you delete your content or account.
        </LegalP>
        <LegalP>
          You are solely responsible for the content you post. HumanChain does not endorse any
          user content and is not liable for any content posted by users.
        </LegalP>
      </LegalSection>

      <LegalSection title="5. WLD payments">
        <LegalP>
          Certain premium features require payment in WLD tokens via World App. All payments
          are processed by World App&apos;s native payment system — HumanChain never has access to
          your private keys or wallet credentials.
        </LegalP>
        <LegalP>
          All WLD payments are final and non-refundable unless required by applicable law.
          HumanChain is not a financial institution and does not provide financial advice.
          WLD is a digital asset and its value can fluctuate.
        </LegalP>
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <LegalP>
          The HumanChain name, logo, design system, and all original content produced by
          HumanChain are the intellectual property of HumanChain and its licensors. Nothing in
          these Terms grants you a right to use HumanChain&apos;s intellectual property except to
          use the Service as intended.
        </LegalP>
      </LegalSection>

      <LegalSection title="7. Disclaimer of warranties">
        <LegalP>
          THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. HUMANCHAIN DOES NOT WARRANT
          THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <LegalP>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, HUMANCHAIN SHALL NOT BE LIABLE
          FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
          LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE
          THE APP, EVEN IF HUMANCHAIN HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          HUMANCHAIN&apos;S TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNT YOU
          PAID TO HUMANCHAIN IN THE 12 MONTHS PRECEDING THE CLAIM.
        </LegalP>
      </LegalSection>

      <LegalSection title="9. Changes to these Terms">
        <LegalP>
          HumanChain may update these Terms from time to time. Continued use of the App after
          changes are posted constitutes acceptance of the revised Terms. The effective date at
          the top of this document will be updated with each revision.
        </LegalP>
      </LegalSection>

      <LegalSection title="10. Governing law">
        <LegalP>
          These Terms are governed by the laws of the jurisdiction in which HumanChain operates,
          without regard to conflict-of-law principles. Any dispute arising from these Terms
          shall be resolved through good-faith negotiation, and if not resolved within 30 days,
          through binding arbitration.
        </LegalP>
      </LegalSection>

      <LegalSection title="11. Contact">
        <LegalP>
          For questions about these Terms, contact us at: brianokindo2022@gmail.com
        </LegalP>
      </LegalSection>
    </>
  );
}

// ── Privacy Policy ────────────────────────────────────────────────────────────

function PrivacyContent() {
  return (
    <>
      <LegalP>
        Effective date: June 25, 2026. Last updated: June 25, 2026.
      </LegalP>
      <LegalP>
        This Privacy Policy explains how HumanChain (&quot;we&quot;, &quot;our&quot;, &quot;the App&quot;) collects, uses,
        and protects information when you use HumanChain inside World App.
      </LegalP>

      <LegalSection title="1. Our privacy principle">
        <LegalP>
          HumanChain is designed to collect the minimum information necessary to operate a
          verified human network. We do not sell your data. We do not build advertising profiles.
          Your World ID proof is zero-knowledge — we never see your biometric data.
        </LegalP>
      </LegalSection>

      <LegalSection title="2. What we collect and why">
        <LegalP><strong>World wallet address.</strong> When you sign in via World App SIWE
          (Sign-In With Ethereum), we receive your wallet address. This is used to identify
          your session, sync your account data, and attribute your posts and listings.
          It is stored hashed (SHA-256) in cloud storage — the raw address is never stored
          on our servers at rest.
        </LegalP>
        <LegalP><strong>World ID nullifier hash.</strong> When you verify with World ID, we
          receive a one-way nullifier hash that proves you are a unique human without revealing
          your identity. This hash is stored to prevent duplicate verifications. We cannot
          reverse it to identify you.
        </LegalP>
        <LegalP><strong>World username and profile picture.</strong> We fetch your public World
          username and profile picture URL from World App&apos;s username service to display your
          identity within HumanChain. This data is public on World App.
        </LegalP>
        <LegalP><strong>User-generated content.</strong> Posts (moments), Ask questions and
          answers, marketplace listings, story submissions, and chain links you create are
          stored locally on your device (localStorage) and optionally synced to Vercel Blob
          cloud storage under your hashed wallet address. You control this data.
        </LegalP>
        <LegalP><strong>Human Passport data.</strong> Your Human Points (HP), streak, tier,
          activity history, and reputation score are stored locally on your device. A summary
          is synced to our Supabase database (points, streak, username, wallet hash) to power
          leaderboards and cross-device sync.
        </LegalP>
        <LegalP><strong>Payment references.</strong> When you make a WLD payment, we store a
          short-lived payment reference (UUID) in Redis for 15 minutes to validate the
          transaction. The reference expires automatically. We never store your payment
          credentials or private keys.
        </LegalP>
        <LegalP><strong>IP address (rate limiting).</strong> For security, API requests include
          your IP address. We use it only for rate limiting (preventing abuse). IP-based rate
          limit records expire within 60 seconds and are not logged or stored permanently.
        </LegalP>
      </LegalSection>

      <LegalSection title="3. What we do NOT collect">
        <LegalUl items={[
          "Biometric data of any kind — World ID verification is zero-knowledge.",
          "Your real name, email address, or government ID.",
          "Your private keys or seed phrase — World App handles all signing.",
          "Precise geolocation — market location is set manually by you.",
          "Device identifiers or tracking cookies.",
          "Browsing history outside HumanChain.",
        ]} />
      </LegalSection>

      <LegalSection title="4. How we use your information">
        <LegalUl items={[
          "To operate and deliver the HumanChain service.",
          "To verify you are a real, unique human using World ID.",
          "To sync your account data across devices via Vercel Blob.",
          "To send you World App notifications you have explicitly enabled.",
          "To detect abuse, spam, and fraudulent activity.",
          "To improve the App based on aggregate (non-personal) usage patterns.",
        ]} />
      </LegalSection>

      <LegalSection title="5. Data sharing">
        <LegalP>
          We do not sell, rent, or trade your personal data. We share data only with:
        </LegalP>
        <LegalUl items={[
          "Vercel — hosting and Blob storage (data processed under Vercel's Data Processing Agreement).",
          "Supabase — database for leaderboard and cross-device sync (data processed under Supabase's DPA).",
          "Upstash — Redis for rate limiting and payment references (short-lived, auto-expiring data).",
          "World App / Worldcoin — World ID verification and notification delivery (governed by Worldcoin's Privacy Policy).",
          "Law enforcement — only when required by a valid legal order.",
        ]} />
      </LegalSection>

      <LegalSection title="6. Data storage and retention">
        <LegalP>
          <strong>Device (localStorage):</strong> All posts, listings, history, HP ledger,
          and settings are stored on your device. You can delete this at any time via
          Settings → Data Management → Delete local account.
        </LegalP>
        <LegalP>
          <strong>Cloud (Vercel Blob):</strong> Account snapshots are stored under your hashed
          wallet address. You can request deletion by contacting us.
        </LegalP>
        <LegalP>
          <strong>Database (Supabase):</strong> Username, hashed wallet, points, and streak.
          Deleted on account deletion request.
        </LegalP>
        <LegalP>
          <strong>Rate limit records (Upstash):</strong> Expire automatically within 60 seconds.
        </LegalP>
        <LegalP>
          <strong>Payment references (Upstash):</strong> Expire automatically after 15 minutes.
          Transaction idempotency keys expire after 30 days.
        </LegalP>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <LegalP>
          Depending on your jurisdiction, you may have rights to access, correct, port, or
          delete your personal data. To exercise any of these rights, contact us at
          brianokindo2022@gmail.com with your wallet address. We will respond within 30 days.
        </LegalP>
        <LegalP>
          You can delete all locally stored data immediately via Settings → Data Management →
          Delete local account.
        </LegalP>
      </LegalSection>

      <LegalSection title="8. Children">
        <LegalP>
          HumanChain is not intended for users under 18. We do not knowingly collect data from
          minors. If you believe a minor has used the App, contact us immediately.
        </LegalP>
      </LegalSection>

      <LegalSection title="9. Changes to this Policy">
        <LegalP>
          We may update this Privacy Policy. We will update the effective date at the top of
          this document when changes are made. Continued use of the App constitutes acceptance.
        </LegalP>
      </LegalSection>

      <LegalSection title="10. Contact">
        <LegalP>
          For privacy questions or data requests: brianokindo2022@gmail.com
        </LegalP>
      </LegalSection>
    </>
  );
}

// ── Main sheet component ──────────────────────────────────────────────────────

export function LegalSheet({
  doc,
  onClose,
}: {
  doc: "terms" | "privacy";
  onClose: () => void;
}) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, []);

  const isTerms = doc === "terms";
  const title = isTerms ? "Terms of Use" : "Privacy Policy";

  return (
    <div className="legal-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <div className="legal-sheet-inner">
        {/* Header */}
        <header className="legal-header">
          <button
            aria-label="Close"
            className="legal-back-btn"
            onClick={onClose}
            type="button"
          >
            <ArrowLeft size={18} />
            <span>Settings</span>
          </button>
          <div className="legal-header-center">
            <ShieldCheck size={16} color="#137a57" />
            <span>{title}</span>
          </div>
        </header>

        {/* Body */}
        <div className="legal-body">
          <h1 className="legal-h1">{title}</h1>
          {isTerms ? <TermsContent /> : <PrivacyContent />}
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}
