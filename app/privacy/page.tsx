import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — HumanChain",
  description: "How HumanChain handles your data inside World App.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, color: "#1a1a1a" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Privacy Policy</h1>
      <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 32 }}>Effective: 1 July 2026 · HumanChain Mini App</p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>1. What we collect</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li><strong>Wallet address</strong> — provided by World App when you sign in via SIWE. Used as your account identifier.</li>
          <li><strong>World ID nullifier hash</strong> — a one-way anonymous proof that you are a unique human. We store only the hash, never your biometric data.</li>
          <li><strong>Content you create</strong> — questions, answers, moments, marketplace listings, and stories you submit.</li>
          <li><strong>Usage data</strong> — anonymous page views and performance metrics via Vercel Analytics/Speed Insights.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>2. How we use it</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>To create and maintain your account and Trust Passport.</li>
          <li>To display your content to other verified users.</li>
          <li>To process WLD payments and confirm transactions via the World Developer Portal.</li>
          <li>To send in-app notifications you explicitly request.</li>
          <li>To prevent spam, fraud, and duplicate accounts through World ID proof.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>3. What we do not do</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>We do not sell your data to third parties.</li>
          <li>We do not collect real names, emails, phone numbers, or government IDs.</li>
          <li>We do not store private keys or seed phrases.</li>
          <li>We do not track you across other apps or websites.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>4. Data storage</h2>
        <p style={{ margin: 0 }}>
          Your content is stored in Supabase (PostgreSQL, EU region) and Vercel Blob (global edge). Session tokens are stored as short-lived httpOnly cookies, never in client storage. Payment references are stored in Upstash Redis with a 15-minute TTL.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>5. Third-party services</h2>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li><strong>Worldcoin / World App</strong> — wallet authentication and World ID verification.</li>
          <li><strong>Vercel</strong> — hosting, serverless compute, Blob storage, and analytics.</li>
          <li><strong>Supabase</strong> — relational database for social and marketplace data.</li>
          <li><strong>Upstash</strong> — ephemeral Redis for rate limiting and payment idempotency.</li>
          <li><strong>Anthropic Claude</strong> — AI-generated verdicts on community questions (no personal data sent).</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>6. Your rights</h2>
        <p style={{ margin: 0 }}>
          You may request deletion of your content and account at any time by contacting us. Because your account is identified by wallet address only, deletion removes all content linked to that address from our systems.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>7. Children</h2>
        <p style={{ margin: 0 }}>
          HumanChain is not directed at users under 13 years of age and we do not knowingly collect data from children.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>8. Changes</h2>
        <p style={{ margin: 0 }}>
          We may update this policy as the app evolves. The effective date at the top of this page reflects the latest revision. Continued use of HumanChain after a change constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8 }}>9. Contact</h2>
        <p style={{ margin: 0 }}>
          For privacy questions: <a href="mailto:brianokindo2022@gmail.com" style={{ color: "#137a57" }}>brianokindo2022@gmail.com</a>
        </p>
      </section>
    </main>
  );
}
