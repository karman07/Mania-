"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const LAST_UPDATED = "June 1, 2026";

const SECTIONS = [
  { id: "acceptance",        title: "1. Acceptance of Terms"          },
  { id: "about",             title: "2. About RaManga"                },
  { id: "accounts",          title: "3. User Accounts"                },
  { id: "creator-terms",     title: "4. Creator Terms"                },
  { id: "content-policy",    title: "5. Content Policy"               },
  { id: "intellectual",      title: "6. Intellectual Property"        },
  { id: "prohibited",        title: "7. Prohibited Uses"              },
  { id: "payments",          title: "8. Payments & Subscriptions"     },
  { id: "termination",       title: "9. Termination"                  },
  { id: "disclaimer",        title: "10. Disclaimer & Liability"      },
  { id: "governing",         title: "11. Governing Law"               },
  { id: "changes",           title: "12. Changes to Terms"            },
  { id: "contact",           title: "13. Contact Us"                  },
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

export default function TermsPage() {
  const [activeId, setActiveId] = useState("acceptance");

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
    <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
      <Navbar />

      {/* hero strip */}
      <div className="ink-bg relative overflow-hidden" style={{ paddingTop: "calc(4rem + 80px)", paddingBottom: "5rem" }}>
        <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-saffron/40 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="font-display text-6xl sm:text-7xl text-white tracking-wider leading-none">
            Terms of <span className="text-gold-light">Service</span>
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

            <Section id="acceptance" title="1. Acceptance of Terms">
              <P>
                Welcome to RaManga. By accessing or using the RaManga platform — including our website, mobile applications, and any related services — you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </P>
              <P>
                These Terms constitute a legally binding agreement between you and RaManga Technologies Pvt. Ltd. ("RaManga", "we", "us", or "our"). You must be at least 13 years old to use our services. Users under 18 must have parental or guardian consent.
              </P>
            </Section>

            <Section id="about" title="2. About RaManga">
              <P>
                RaManga is a global manga reading and publishing platform that connects creators with readers worldwide. Our mission is to democratise manga storytelling by enabling creators from any country to share their work with a global audience.
              </P>
              <P>Our platform provides:</P>
              <UL items={[
                "A digital library of manga titles from independent and professional creators across the world",
                "Tools for creators to upload, manage, and monetise their manga series",
                "Community features including bookmarking, ratings, and reviews",
                "Personalised reading experiences based on genre preferences and reading history",
                "Free and premium content tiers to suit every reader",
              ]} />
            </Section>

            <Section id="accounts" title="3. User Accounts">
              <P>
                To access most features, you must create an account. When registering, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
              </P>
              <P>You agree to:</P>
              <UL items={[
                "Use only one account unless explicitly authorised otherwise",
                "Not share your account credentials with any third party",
                "Notify us immediately at support@ramanga.com if you suspect unauthorised access",
                "Keep your profile information accurate and up to date",
                "Not create an account if you have been previously banned by RaManga",
              ]} />
              <P>
                We reserve the right to suspend or terminate accounts that violate these Terms, contain false information, or are used for fraudulent purposes.
              </P>
            </Section>

            <Section id="creator-terms" title="4. Creator Terms">
              <P>
                As a Creator on RaManga, you gain access to our publishing tools and audience. By uploading content, you agree to the following additional terms:
              </P>
              <P><strong className="text-ink dark:text-cream">Content Ownership:</strong> You retain all ownership and copyright of the manga you publish on RaManga. By uploading, you grant RaManga a non-exclusive, worldwide, royalty-free licence to host, display, distribute, and promote your content on our platform and affiliated channels.</P>
              <P><strong className="text-ink dark:text-cream">Revenue Share:</strong> Creators whose content is part of our monetisation programme receive a share of revenue generated from their titles. The specific revenue split is outlined in the Creator Revenue Agreement, which you accept separately upon joining the programme.</P>
              <P><strong className="text-ink dark:text-cream">Content Standards:</strong> All uploaded manga must comply with our Content Policy (Section 5). RaManga reserves the right to remove content that violates our policies without prior notice.</P>
              <P><strong className="text-ink dark:text-cream">Originality:</strong> You must own the rights to all content you upload, or have obtained necessary permissions. Uploading content that infringes on third-party intellectual property rights is strictly prohibited.</P>
            </Section>

            <Section id="content-policy" title="5. Content Policy">
              <P>
                RaManga is committed to being a platform that welcomes diverse stories while maintaining a safe and respectful environment. The following types of content are strictly prohibited:
              </P>
              <UL items={[
                "Sexual content involving minors (CSAM) — zero tolerance, reported to authorities immediately",
                "Content that glorifies or promotes real-world violence, hate crimes, or terrorism",
                "Hate speech targeting individuals or groups based on race, ethnicity, religion, gender, sexual orientation, or disability",
                "Content that harasses, threatens, or doxes real individuals",
                "Malware, phishing attempts, or deceptive content designed to harm users",
                "Copyrighted material uploaded without permission (subject to DMCA takedown)",
              ]} />
              <P>
                Mature content (violence, adult themes) may be permitted under our Adult Content category, which is age-gated and requires creator acknowledgement. Explicit sexual content between adults must be marked accordingly and is only accessible to verified adult accounts.
              </P>
              <P>
                RaManga uses both automated systems and human moderators to review content. Users can report violating content via the flag button on any manga page.
              </P>
            </Section>

            <Section id="intellectual" title="6. Intellectual Property">
              <P>
                The RaManga platform, including its design, logo, interface, and proprietary software, is owned by RaManga Technologies Pvt. Ltd. and is protected by copyright, trademark, and other applicable intellectual property laws.
              </P>
              <P>
                You may not reproduce, distribute, modify, create derivative works of, or publicly display any portion of our platform without explicit written permission, except as permitted by these Terms or applicable law.
              </P>
              <P>
                If you believe your intellectual property rights have been infringed, please submit a DMCA notice to dmca@ramanga.com. We respond to valid DMCA notices within 5 business days.
              </P>
            </Section>

            <Section id="prohibited" title="7. Prohibited Uses">
              <P>You agree not to use RaManga to:</P>
              <UL items={[
                "Scrape, crawl, or systematically download content for redistribution or training AI models",
                "Use bots, scripts, or automation to artificially inflate ratings, views, or engagement",
                "Circumvent any access restrictions, DRM, or security features",
                "Impersonate RaManga staff, other users, or creators",
                "Engage in spam, unsolicited advertising, or pyramid schemes in community features",
                "Attempt to gain unauthorised access to other user accounts or backend systems",
                "Upload or transmit viruses, malware, or any code designed to damage or interrupt service",
              ]} />
            </Section>

            <Section id="payments" title="8. Payments & Subscriptions">
              <P>
                RaManga offers both free and premium content. Premium subscriptions are billed on a monthly or annual basis. By subscribing, you authorise us to charge your payment method on a recurring basis until you cancel.
              </P>
              <P>
                Subscriptions can be cancelled at any time from your account settings. Upon cancellation, you retain access until the end of your current billing period. We do not offer refunds for partial billing periods.
              </P>
              <P>
                Coin purchases (used for unlocking individual chapters) are non-refundable unless required by applicable law. We reserve the right to adjust pricing with 30 days notice to active subscribers.
              </P>
            </Section>

            <Section id="termination" title="9. Termination">
              <P>
                You may delete your account at any time from Profile Settings. Upon deletion, your personal data is removed in accordance with our Privacy Policy, though content you have published may remain on the platform unless you explicitly request its removal before account deletion.
              </P>
              <P>
                RaManga may suspend or terminate your account immediately, without notice, if you violate these Terms, engage in fraudulent activity, or your account poses a risk to other users or the platform.
              </P>
            </Section>

            <Section id="disclaimer" title="10. Disclaimer & Liability">
              <P>
                RaManga is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or completely secure.
              </P>
              <P>
                To the maximum extent permitted by law, RaManga shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of — or inability to use — our services. Our total liability to you for any claim shall not exceed the amount you paid to RaManga in the 12 months preceding the claim.
              </P>
            </Section>

            <Section id="governing" title="11. Governing Law">
              <P>
                These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Chandigarh, India.
              </P>
              <P>
                If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.
              </P>
            </Section>

            <Section id="changes" title="12. Changes to Terms">
              <P>
                We may update these Terms from time to time. When we make significant changes, we will notify you via email or a prominent notice on the platform at least 14 days before the changes take effect.
              </P>
              <P>
                Your continued use of RaManga after the effective date of updated Terms constitutes your acceptance of the changes. If you do not agree with the updated Terms, you must stop using the platform and may delete your account.
              </P>
            </Section>

            <Section id="contact" title="13. Contact Us">
              <P>If you have questions about these Terms, please reach out to us:</P>
              <div className="mt-3 p-5 rounded-2xl bg-white dark:bg-[#120D22] border-2 border-saffron/15">
                <p className="font-bold text-ink dark:text-cream mb-2">RaManga Technologies Pvt. Ltd.</p>
                <div className="flex flex-col gap-1 text-sm text-ink/60 dark:text-cream/50">
                  <p>Email: <a href="mailto:legal@ramanga.com" className="text-saffron hover:underline">legal@ramanga.com</a></p>
                  <p>Support: <a href="mailto:support@ramanga.com" className="text-saffron hover:underline">support@ramanga.com</a></p>
                  <p>DMCA: <a href="mailto:dmca@ramanga.com" className="text-saffron hover:underline">dmca@ramanga.com</a></p>
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
