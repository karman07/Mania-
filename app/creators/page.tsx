"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/components/AuthProvider";
import {
  IconPencil, IconUsers, IconGift, IconTrendingUp,
  IconBook, IconArrowRight, IconSparkles,
} from "@/app/components/Icons";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/* ── creator type from API ─────────────────── */
type Creator = {
  _id: string;
  penName: string;
  bio: string;
  genres: string[];
  displayName?: string;
  portfolioUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  createdAt: string;
};

/* ── static benefits / steps (no user data) ─ */
const BENEFITS = [
  {
    Icon: IconUsers,
    title: "Reach 2M+ Readers",
    body: "Publish on a platform with a massive, passionate manga community hungry for new stories.",
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-100 dark:border-blue-800/30",
  },
  {
    Icon: IconGift,
    title: "Monetise Your Work",
    body: "Earn through chapter unlocks, subscriptions, and reader tips. No upfront cost, ever.",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-100 dark:border-emerald-800/30",
  },
  {
    Icon: IconPencil,
    title: "Full Creative Control",
    body: "You own your story, your characters, your world. We just provide the stage.",
    color: "text-saffron dark:text-saffron-bright",
    bg: "bg-saffron/8 dark:bg-saffron/10",
    border: "border-saffron/20 dark:border-saffron/20",
  },
  {
    Icon: IconTrendingUp,
    title: "Analytics & Growth",
    body: "Track reads, retention, fan comments, and revenue — all in your creator dashboard.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-100 dark:border-emerald-800/30",
  },
];

const STEPS = [
  { n: "01", title: "Create Your Account",   body: "Sign up free and go through creator onboarding. Set up your profile in minutes." },
  { n: "02", title: "Publish Your Chapters", body: "Upload artwork, write dialogue, set chapter order. Our editor makes it simple." },
  { n: "03", title: "Grow & Earn",           body: "Build your audience, unlock monetisation, and get paid for what you love." },
];

const FAQS = [
  { q: "Is it free to start?",            a: "Yes — publishing on RaManga is completely free. We only take a small percentage when you earn." },
  { q: "Do I keep rights to my manga?",   a: "Absolutely. You retain full ownership of your story and characters. We are just your publisher." },
  { q: "How do I get paid?",              a: "Earnings are transferred monthly via bank transfer or UPI. Minimum payout is ₹500." },
  { q: "What art style do you accept?",   a: "Any style — manga, manhwa, manhua, webtoon, or original. If it's sequential storytelling, it belongs here." },
];

/* ── creator card ─────────────────────────── */
function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="group rounded-2xl bg-white dark:bg-[#1A1A1A] border-2 border-ink/5 dark:border-cream/5 hover:border-saffron/30 dark:hover:border-saffron/20 p-5 flex gap-4 transition-all card-hover">
      <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border-2 border-saffron/20 bg-saffron/5">
        <Image
          src="/writer_image.png"
          alt={creator.penName}
          width={56}
          height={56}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-ink dark:text-cream group-hover:text-saffron dark:group-hover:text-saffron-bright transition-colors">{creator.penName}</p>
        <p className="text-xs text-ink/40 dark:text-cream/40 truncate mt-0.5 line-clamp-2">{creator.bio}</p>
        {creator.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {creator.genres.slice(0, 3).map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-saffron/10 dark:bg-saffron/15 text-saffron dark:text-saffron-bright text-[10px] font-semibold">{g}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────── */
export default function CreatorsPage() {
  const { user, openDialog } = useAuth();
  const [creators, setCreators]   = useState<Creator[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/creators`)
      .then((r) => r.json())
      .then((data) => setCreators(Array.isArray(data) ? data : []))
      .catch(() => setCreators([]))
      .finally(() => setFetchLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
      <Navbar />

      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-ink dark:bg-[#090909] pt-20">
        <div className="absolute inset-0 halftone opacity-25 pointer-events-none" />
        <div className="absolute inset-0 speed-lines pointer-events-none opacity-30" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-saffron/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-gold/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron/15 border border-saffron/30 text-saffron text-xs font-bold uppercase tracking-widest mb-6">
                <IconSparkles size={12} />
                For Creators
              </span>

              <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-white tracking-wider leading-none mb-6">
                Create.{" "}
                <span className="gradient-text">Publish.</span>
                <br />
                Inspire.
              </h1>

              <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10">
                Join independent manga artists who are building audiences, earning income, and telling the stories only they can tell — on RaManga.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                {user?.role === "creator" ? (
                  <Link
                    href="/creator/portal"
                    className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-saffron text-white font-semibold text-base manga-border hover:bg-saffron/90 transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
                  >
                    Go to Creator Portal
                    <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : user ? (
                  <Link
                    href="/creator/onboard"
                    className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-saffron text-white font-semibold text-base manga-border hover:bg-saffron/90 transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
                  >
                    Start Creating Free
                    <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <button
                    onClick={openDialog}
                    className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-saffron text-white font-semibold text-base manga-border hover:bg-saffron/90 transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
                  >
                    Start Creating Free
                    <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )}
                <Link
                  href="#how-it-works"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/20 text-white font-semibold text-base hover:border-white/50 hover:bg-white/5 transition-all"
                >
                  How it works
                </Link>
              </div>

              <div className="flex flex-wrap gap-8">
                {[
                  { value: creators.length > 0 ? `${creators.length}+` : "—", label: "Active creators" },
                  { value: "2M+",  label: "Monthly readers" },
                  { value: "₹0",   label: "To get started" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-display text-4xl text-gold-light tracking-wide">{value}</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-[440px] rounded-2xl overflow-hidden">
                <Image
                  src="/writer_image.png"
                  alt="Manga creator at work"
                  width={440}
                  height={540}
                  className="w-full h-[540px] object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────── */}
      <section className="py-20 md:py-28 bg-cream dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-saffron dark:text-saffron-bright uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
              <span className="w-6 h-px bg-saffron dark:bg-saffron-bright" />
              Why RaManga
              <span className="w-6 h-px bg-saffron dark:bg-saffron-bright" />
            </p>
            <h2 className="font-display text-5xl sm:text-6xl text-ink dark:text-cream tracking-wider">
              Built for <span className="gradient-text">Creators</span>
            </h2>
            <p className="text-ink/50 dark:text-cream/50 text-base mt-3 max-w-md mx-auto">
              Everything you need to focus on the story — we handle the rest.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map(({ Icon, title, body, color, bg, border }) => (
              <div key={title} className={`rounded-2xl border-2 ${border} ${bg} p-6 flex flex-col gap-4`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-white/5">
                  <Icon size={22} className={color} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink dark:text-cream mb-1">{title}</h3>
                  <p className="text-sm text-ink/55 dark:text-cream/55 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-parchment dark:bg-[#100B1E] relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-saffron dark:text-saffron-bright uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
              <span className="w-6 h-px bg-saffron dark:bg-saffron-bright" />
              The Process
              <span className="w-6 h-px bg-saffron dark:bg-saffron-bright" />
            </p>
            <h2 className="font-display text-5xl sm:text-6xl text-ink dark:text-cream tracking-wider">
              Three Steps to <span className="gradient-text">Launch</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#1A1A1A] manga-border flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="font-display text-4xl gradient-text leading-none">{n}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ink dark:text-cream mb-2">{title}</h3>
                  <p className="text-sm text-ink/55 dark:text-cream/55 leading-relaxed max-w-xs mx-auto">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            {user?.role === "creator" ? (
              <Link href="/creator/portal" className="group flex items-center gap-2 px-8 py-4 rounded-full bg-saffron text-white font-semibold text-base manga-border hover:bg-saffron/90 transition-all hover:scale-105 active:scale-95">
                Go to Creator Portal <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            ) : user ? (
              <Link href="/creator/onboard" className="group flex items-center gap-2 px-8 py-4 rounded-full bg-saffron text-white font-semibold text-base manga-border hover:bg-saffron/90 transition-all hover:scale-105 active:scale-95">
                Start for Free — No Card Needed <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <button onClick={openDialog} className="group flex items-center gap-2 px-8 py-4 rounded-full bg-saffron text-white font-semibold text-base manga-border hover:bg-saffron/90 transition-all hover:scale-105 active:scale-95">
                Start for Free — No Card Needed <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Creators Grid ────────────────────────── */}
      <section id="creators" className="py-20 md:py-28 bg-cream dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-bold text-saffron dark:text-saffron-bright uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                <span className="w-4 h-px bg-saffron dark:bg-saffron-bright inline-block" />
                Community
              </p>
              <h2 className="font-display text-5xl sm:text-6xl text-ink dark:text-cream tracking-wider">
                Meet Our <span className="gradient-text">Creators</span>
              </h2>
            </div>
            <Link href="/browse" className="self-start sm:self-auto text-sm font-semibold text-saffron dark:text-saffron-bright hover:underline underline-offset-4">
              Browse all manga →
            </Link>
          </div>

          {fetchLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white dark:bg-[#1A1A1A] border-2 border-ink/5 dark:border-cream/5 p-5 flex gap-4 animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-ink/5 dark:bg-cream/5 flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2 pt-1">
                    <div className="h-3 w-28 bg-ink/8 dark:bg-cream/8 rounded" />
                    <div className="h-2 w-40 bg-ink/5 dark:bg-cream/5 rounded" />
                    <div className="h-2 w-20 bg-ink/5 dark:bg-cream/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : creators.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-5 text-center">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-saffron/20 mx-auto">
                <Image src="/writer_image.png" alt="Creator" width={96} height={96} className="w-full h-full object-cover" />
              </div>
              <p className="font-display text-3xl text-ink/30 dark:text-cream/30">No creators yet</p>
              <p className="text-sm text-ink/40 dark:text-cream/40 max-w-xs">Be the first to publish on RaManga. Sign up and apply in under 2 minutes.</p>
              {user ? (
                <Link href="/creator/onboard" className="flex items-center gap-2 px-6 py-3 rounded-full bg-saffron text-white font-semibold manga-border hover:bg-saffron/90 transition-all">
                  Apply as Creator <IconArrowRight size={14} />
                </Link>
              ) : (
                <button onClick={openDialog} className="flex items-center gap-2 px-6 py-3 rounded-full bg-saffron text-white font-semibold manga-border hover:bg-saffron/90 transition-all">
                  Get Started Free <IconArrowRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {creators.map((c) => <CreatorCard key={c._id} creator={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-parchment dark:bg-[#100B1E]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-5xl sm:text-6xl text-ink dark:text-cream tracking-wider mb-3">
              Questions <span className="gradient-text">Answered</span>
            </h2>
            <p className="text-ink/50 dark:text-cream/50 text-sm">Everything you need to know before you start.</p>
          </div>
          <div className="flex flex-col gap-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-2xl bg-white dark:bg-[#1A1A1A] border-2 border-ink/5 dark:border-cream/5 p-6">
                <p className="font-bold text-sm text-ink dark:text-cream mb-2">{q}</p>
                <p className="text-sm text-ink/55 dark:text-cream/55 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────── */}
      <section className="py-20 md:py-28 bg-cream dark:bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-saffron via-saffron/90 to-gold p-10 md:p-14 manga-border relative overflow-hidden">
            <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-4">Ready to start?</p>
              <h2 className="font-display text-5xl sm:text-6xl text-white tracking-wider mb-4 leading-tight">
                Your story deserves<br />to be read.
              </h2>
              <p className="text-white/80 text-base mb-8 max-w-md mx-auto">
                Publish your first chapter today — it&apos;s free, always.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {user?.role === "creator" ? (
                  <Link href="/creator/portal" className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white text-saffron font-bold text-base hover:bg-cream transition-all hover:scale-105 active:scale-95 manga-border shadow-lg">
                    Open Creator Portal <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : user ? (
                  <Link href="/creator/onboard" className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white text-saffron font-bold text-base hover:bg-cream transition-all hover:scale-105 active:scale-95 manga-border shadow-lg">
                    Apply as Creator <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <button onClick={openDialog} className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white text-saffron font-bold text-base hover:bg-cream transition-all hover:scale-105 active:scale-95 manga-border shadow-lg">
                    Create Your Account <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                )}
                <Link href="/browse" className="px-8 py-4 rounded-full border-2 border-white/50 text-white font-semibold text-base hover:border-white hover:bg-white/10 transition-all">
                  Explore Manga First
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
