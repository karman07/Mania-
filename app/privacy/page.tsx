"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const LAST_UPDATED = "June 1, 2026";

const SECTIONS = [
  { id: "intro",         title: "1. Introduction"                    },
  { id: "collect",       title: "2. Information We Collect"          },
  { id: "use",           title: "3. How We Use Your Information"     },
  { id: "sharing",       title: "4. Information Sharing"             },
  { id: "retention",     title: "5. Data Retention"                  },
  { id: "security",      title: "6. Security"                        },
  { id: "cookies",       title: "7. Cookies & Tracking"              },
  { id: "children",      title: "8. Children's Privacy"              },
  { id: "rights",        title: "9. Your Rights & Choices"           },
  { id: "transfers",     title: "10. International Transfers"        },
  { id: "creators-data", title: "11. Creator Data"                   },
  { id: "changes",       title: "12. Changes to This Policy"         },
  { id: "contact",       title: "13. Contact Us"                     },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 mb-12">
      <h2 className="font-display text-2xl text-ink dark:text-cream tracking-wide mb-4 flex items-center gap-3">
        <span className="w-1 h-6 rounded-full bg-saffron flex-shrink-0" />
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-ink/70 dark:text-cream/65 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 ml-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-saffron flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="rounded-2xl border border-ink/8 dark:border-cream/8 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-saffron/8 dark:bg-saffron/10">
            <th className="text-left px-4 py-3 font-semibold text-ink/70 dark:text-cream/60 w-2/5">Category</th>
            <th className="text-left px-4 py-3 font-semibold text-ink/70 dark:text-cream/60">What we collect</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([cat, detail], i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-white/3" : "bg-cream/50 dark:bg-white/5"}>
              <td className="px-4 py-3 font-semibold text-ink dark:text-cream">{cat}</td>
              <td className="px-4 py-3 text-ink/60 dark:text-cream/50">{detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  const [activeId, setActiveId] = useState("intro");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0C0818]">
      <Navbar />

      {/* hero strip */}
      <div className="ink-bg relative overflow-hidden" style={{ paddingTop: "calc(4rem + 80px)", paddingBottom: "5rem" }}>
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-saffron/40 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="font-display text-6xl sm:text-7xl text-white tracking-wider leading-none">
            Privacy <span className="text-gold-light">Policy</span>
          </h1>
          <p className="text-white/50 mt-5 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="flex gap-12">

          {/* sticky TOC */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40 dark:text-cream/35 mb-4">
                On this page
              </p>
              <nav className="flex flex-col gap-1">
                {SECTIONS.map(({ id, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`text-xs py-1.5 px-3 rounded-lg transition-all ${
                      activeId === id
                        ? "bg-saffron/10 text-saffron font-semibold"
                        : "text-ink/45 dark:text-cream/40 hover:text-saffron dark:hover:text-saffron"
                    }`}
                  >
                    {title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* content */}
          <article className="flex-1 min-w-0">

            <Section id="intro" title="1. Introduction">
              <P>
                RaManga Technologies Pvt. Ltd. ("RaManga", "we", "us", or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use our platform at ramanga.com and our mobile applications.
              </P>
              <P>
                By using RaManga, you agree to the collection and use of information in accordance with this policy. We encourage you to read it carefully. If you have any questions, please contact us at <a href="mailto:privacy@ramanga.com" className="text-saffron hover:underline">privacy@ramanga.com</a>.
              </P>
            </Section>

            <Section id="collect" title="2. Information We Collect">
              <P>We collect information in three ways: information you give us, information we collect automatically, and information from third parties.</P>
              <InfoTable rows={[
                ["Account Info",     "Name, email address, username, date of birth, gender, profile photo"],
                ["Contact Details",  "Country, phone number with country code (optional)"],
                ["Preferences",     "Favourite genres, reading history, bookmarks, ratings"],
                ["Creator Data",    "Bank/payment details (encrypted), published manga metadata"],
                ["Usage Data",      "Pages visited, chapters read, time spent, search queries"],
                ["Device Info",     "IP address, browser type, OS, device identifiers"],
                ["Cookies",         "Session tokens, preference settings, analytics identifiers"],
                ["Payment Info",    "Billing address, last 4 card digits (full card data handled by Stripe)"],
              ]} />
            </Section>

            <Section id="use" title="3. How We Use Your Information">
              <P>We use your data for the following purposes:</P>
              <UL items={[
                "Provide, operate, and improve the RaManga platform and its features",
                "Personalise your reading experience based on your genre preferences and reading history",
                "Process payments for subscriptions and coin purchases",
                "Send transactional emails (account confirmation, payment receipts, chapter update notifications)",
                "Send marketing communications — only with your consent, and you can opt out at any time",
                "Detect and prevent fraud, abuse, and violations of our Terms of Service",
                "Comply with legal obligations and respond to lawful requests from authorities",
                "Conduct analytics to understand how our platform is used and improve it",
                "Enable creator features such as analytics dashboards and revenue reporting",
              ]} />
              <P>
                We rely on the following legal bases for processing: contract performance (to provide services you signed up for), legitimate interests (fraud prevention, platform improvement), legal obligation (compliance), and consent (marketing, optional features).
              </P>
            </Section>

            <Section id="sharing" title="4. Information Sharing">
              <P>We do not sell your personal data. We share it only in the following circumstances:</P>
              <UL items={[
                "Service Providers: Companies we engage to help operate our platform (cloud hosting, payment processing via Stripe, email delivery via SendGrid, analytics via Mixpanel). These partners are contractually bound to protect your data.",
                "Creators: If you purchase or unlock a creator's content, your username (not email or contact details) may be visible to that creator in aggregate analytics.",
                "Legal Requirements: We may disclose data to comply with court orders, subpoenas, or legal processes, or to protect the rights, property, or safety of RaManga or others.",
                "Business Transfers: In the event of a merger, acquisition, or asset sale, your data may be transferred. We will notify you before your data becomes subject to a different privacy policy.",
                "With Your Consent: We share data for any other purpose with your explicit consent.",
              ]} />
            </Section>

            <Section id="retention" title="5. Data Retention">
              <P>
                We retain your personal data for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and personal data at any time from Profile Settings or by contacting us.
              </P>
              <P>
                Upon account deletion, we remove your personal data within 30 days, except where we are required to retain it by law (e.g., financial transaction records which are retained for 7 years per tax regulations). Anonymised analytics data may be retained indefinitely.
              </P>
              <P>
                Creator-published manga content is retained until the creator requests its removal, as readers may have purchased or bookmarked it.
              </P>
            </Section>

            <Section id="security" title="6. Security">
              <P>
                We take the security of your data seriously. We implement industry-standard technical and organisational measures including:
              </P>
              <UL items={[
                "TLS/HTTPS encryption for all data in transit",
                "AES-256 encryption for sensitive data at rest",
                "Firebase Authentication for secure user sessions",
                "Role-based access controls limiting internal access to personal data",
                "Regular security audits and penetration testing",
                "SOC-2 compliant cloud infrastructure (Google Cloud Platform)",
              ]} />
              <P>
                No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. If you discover a security vulnerability, please responsibly disclose it to <a href="mailto:security@ramanga.com" className="text-saffron hover:underline">security@ramanga.com</a>.
              </P>
            </Section>

            <Section id="cookies" title="7. Cookies & Tracking">
              <P>
                RaManga uses cookies and similar technologies to operate our platform and understand usage patterns. We use:
              </P>
              <UL items={[
                "Essential Cookies: Required for authentication, session management, and core platform functionality. Cannot be disabled.",
                "Preference Cookies: Store your language, theme (dark/light mode), and reading preferences.",
                "Analytics Cookies: Help us understand how users interact with our platform (e.g., Google Analytics, Mixpanel). You can opt out via browser settings or the cookie consent banner.",
                "Marketing Cookies: Used only with your explicit consent to show relevant advertisements or track campaign performance.",
              ]} />
              <P>
                You can manage cookie preferences through your browser settings or our Cookie Settings panel. Disabling essential cookies may impact platform functionality.
              </P>
            </Section>

            <Section id="children" title="8. Children's Privacy">
              <P>
                RaManga is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href="mailto:privacy@ramanga.com" className="text-saffron hover:underline">privacy@ramanga.com</a> and we will delete the information.
              </P>
              <P>
                Users aged 13–17 may use RaManga with parental consent. Certain mature content categories are restricted to users who have verified they are 18 or older.
              </P>
            </Section>

            <Section id="rights" title="9. Your Rights & Choices">
              <P>
                Depending on your location, you may have the following rights regarding your personal data:
              </P>
              <UL items={[
                "Access: Request a copy of the personal data we hold about you",
                "Correction: Update inaccurate or incomplete data (most fields are editable in Profile Settings)",
                "Deletion: Request deletion of your account and personal data",
                "Portability: Request your data in a structured, machine-readable format",
                "Objection: Object to processing of your data for marketing purposes",
                "Restriction: Request that we limit how we process your data in certain circumstances",
                "Withdraw Consent: Withdraw consent for processing where consent was the legal basis",
              ]} />
              <P>
                To exercise any of these rights, contact us at <a href="mailto:privacy@ramanga.com" className="text-saffron hover:underline">privacy@ramanga.com</a>. We respond to all valid requests within 30 days. Users in the EU/EEA also have the right to lodge a complaint with their local data protection authority.
              </P>
            </Section>

            <Section id="transfers" title="10. International Data Transfers">
              <P>
                RaManga is operated from India and our servers are primarily hosted on Google Cloud Platform (Mumbai region). If you access our services from outside India, your data may be transferred to and processed in India or other countries where our service providers operate.
              </P>
              <P>
                For users in the European Economic Area (EEA) or UK, we ensure such transfers comply with applicable data protection laws through Standard Contractual Clauses (SCCs) or other appropriate safeguards as recognised by relevant authorities.
              </P>
            </Section>

            <Section id="creators-data" title="11. Creator Data">
              <P>
                Creators on RaManga have additional data considerations:
              </P>
              <UL items={[
                "Analytics Data: We provide creators with aggregated analytics about their content's performance (views, reads, ratings, revenue). This data does not include individual reader identities.",
                "Payment Data: Bank account or UPI details provided for payouts are encrypted and handled through our payment partner. We do not store full bank details on our servers.",
                "Content Metadata: Title, description, tags, and upload dates of your manga are publicly visible and indexed by search engines.",
                "Identity Verification: For payment eligibility, we may require government ID verification, handled by our KYC partner with strict data minimisation.",
              ]} />
            </Section>

            <Section id="changes" title="12. Changes to This Policy">
              <P>
                We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top and notify you via email or a prominent notice on the platform for significant changes.
              </P>
              <P>
                Your continued use of RaManga after any changes constitutes your acceptance of the updated policy. We encourage you to review this page periodically.
              </P>
            </Section>

            <Section id="contact" title="13. Contact Us">
              <P>For any privacy-related questions, requests, or concerns:</P>
              <div className="mt-3 p-5 rounded-2xl bg-white dark:bg-[#120D22] border-2 border-saffron/15">
                <p className="font-bold text-ink dark:text-cream mb-2">Data Privacy Officer — RaManga</p>
                <div className="flex flex-col gap-1 text-sm text-ink/60 dark:text-cream/50">
                  <p>Email: <a href="mailto:privacy@ramanga.com" className="text-saffron hover:underline">privacy@ramanga.com</a></p>
                  <p>Security: <a href="mailto:security@ramanga.com" className="text-saffron hover:underline">security@ramanga.com</a></p>
                  <p>Response time: Within 30 days for all verified requests</p>
                </div>
              </div>
            </Section>

          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}
