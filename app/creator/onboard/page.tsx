"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/components/AuthProvider";
import {
  IconPencil, IconArrowRight, IconSword, IconHeart, IconWand, IconShield,
  IconSmile, IconCoffee, IconSparkles, IconLandmark, IconBook,
} from "@/app/components/Icons";

/* ── genre chips ────────────────────────────────── */
const GENRES = [
  { name: "Action",        Icon: IconSword    },
  { name: "Romance",       Icon: IconHeart    },
  { name: "Fantasy",       Icon: IconWand     },
  { name: "Horror",        Icon: IconShield   },
  { name: "Comedy",        Icon: IconSmile    },
  { name: "Slice of Life", Icon: IconCoffee   },
  { name: "Sci-Fi",        Icon: IconSparkles },
  { name: "Historical",    Icon: IconLandmark },
];

const inputCls =
  "w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/60 transition-colors";

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-ink/55 dark:text-cream/45 uppercase tracking-wide">
          {label}
          {required && <span className="text-saffron ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-ink/30 dark:text-cream/30">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function CheckboxItem({
  id, checked, onChange, children,
}: { id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
        checked ? "bg-saffron border-saffron" : "border-ink/20 dark:border-cream/20 group-hover:border-saffron/50"
      }`}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="text-sm text-ink/70 dark:text-cream/60 leading-relaxed">{children}</span>
    </label>
  );
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function CreatorOnboardPage() {
  const { user, firebaseUser, loading, openDialog, applyAsCreator } = useAuth();
  const router = useRouter();

  const [step, setStep]               = useState(1);
  const [penName, setPenName]         = useState("");
  const [bio, setBio]                 = useState("");
  const [genres, setGenres]           = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl]   = useState("");
  const [termsAccepted, setTerms]     = useState(false);
  const [privacyAccepted, setPrivacy] = useState(false);
  const [busy, setBusy]               = useState(false);
  const [error, setError]             = useState("");

  /* photo upload */
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  }

  // Redirect if already a creator
  useEffect(() => {
    if (!loading && user?.role === "creator") router.replace("/creator/portal");
  }, [loading, user, router]);

  const toggleGenre = useCallback((name: string) => {
    setGenres((prev) =>
      prev.includes(name)
        ? prev.filter((g) => g !== name)
        : prev.length < 3 ? [...prev, name] : prev
    );
  }, []);

  async function handleSubmit() {
    if (!termsAccepted || !privacyAccepted) {
      setError("You must accept both the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setBusy(true); setError("");
    try {
      let uploadedPhotoURL: string | undefined;

      if (photoFile && firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const formData = new FormData();
        formData.append("photo", photoFile);
        const res = await fetch(`${API}/creators/upload-photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Photo upload failed");
        const data = await res.json();
        uploadedPhotoURL = `${API}${data.photoURL}`;
      }

      await applyAsCreator({
        penName: penName.trim(),
        bio: bio.trim(),
        genres,
        portfolioUrl: portfolioUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        photoURL: uploadedPhotoURL,
        termsAccepted,
        privacyAccepted,
      });
      router.push("/creator/portal");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
        <Navbar />
        <div className="pt-32 flex justify-center">
          <span className="w-8 h-8 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
        <Navbar />
        <div className="pt-40 flex flex-col items-center gap-5 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-saffron/10 border-2 border-saffron/20 flex items-center justify-center">
            <IconPencil size={28} className="text-saffron" />
          </div>
          <h1 className="font-display text-4xl text-ink dark:text-cream tracking-wider">Sign in to apply</h1>
          <p className="text-ink/50 dark:text-cream/50 text-sm max-w-xs">
            You need a RaManga account to become a creator. It&apos;s free.
          </p>
          <button
            onClick={openDialog}
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-saffron text-white font-semibold manga-border hover:bg-saffron/90 transition-all"
          >
            Sign Up Free <IconArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  const STEPS = ["Your Identity", "Creative Style", "Agreement"];

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-xl mx-auto">

          {/* Back */}
          <Link href="/creators" className="flex items-center gap-2 text-sm text-ink/40 dark:text-cream/40 hover:text-saffron transition-colors mb-6 group w-fit">
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            Back to Creators
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-saffron/10 border-2 border-saffron/20 flex items-center justify-center flex-shrink-0">
              <IconPencil size={26} className="text-saffron" />
            </div>
            <div>
              <h1 className="font-display text-4xl text-ink dark:text-cream tracking-wider">Become a Creator</h1>
              <p className="text-sm text-ink/45 dark:text-cream/40 mt-0.5">Free to start. No card required.</p>
            </div>
          </div>

          {/* Step bar */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => {
              const s = i + 1;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all ${
                    step > s ? "bg-saffron border-saffron text-white"
                    : step === s ? "border-saffron text-saffron"
                    : "border-ink/15 dark:border-cream/15 text-ink/30 dark:text-cream/30"
                  }`}>
                    {step > s ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : s}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${
                    step === s ? "text-ink dark:text-cream" : "text-ink/30 dark:text-cream/30"
                  }`}>{label}</span>
                  {s < STEPS.length && (
                    <div className={`flex-1 h-px transition-colors ${step > s ? "bg-saffron/50" : "bg-ink/10 dark:bg-cream/10"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Step 1: Identity ── */}
          {step === 1 && (
            <div className="bg-white dark:bg-[#120D22] rounded-3xl p-6 border border-ink/5 dark:border-cream/5 flex flex-col gap-5">
              <div>
                <h2 className="font-display text-2xl text-ink dark:text-cream tracking-wide mb-1">Your Creator Identity</h2>
                <p className="text-sm text-ink/45 dark:text-cream/40">This is how readers will know you.</p>
              </div>

              {/* Photo upload */}
              <div className="flex flex-col items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-saffron/30 hover:border-saffron/60 bg-saffron/5 hover:bg-saffron/10 transition-all"
                >
                  <Image
                    src={photoPreview || "/writer_image.png"}
                    alt="Creator photo"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span className="text-white text-[10px] font-semibold">Change photo</span>
                  </div>
                </button>
                <p className="text-[10px] text-ink/35 dark:text-cream/35">
                  {photoFile ? photoFile.name : "Click to upload your photo (optional)"}
                </p>
              </div>

              <Field label="Pen Name" required hint="shown on your manga">
                <input
                  type="text"
                  value={penName}
                  onChange={(e) => setPenName(e.target.value)}
                  placeholder="Your creative name"
                  className={inputCls}
                  maxLength={50}
                />
              </Field>

              <Field label="About You" required hint={`${bio.length}/500`}>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers who you are and what inspires your stories…"
                  className={`${inputCls} resize-none h-28`}
                  maxLength={500}
                />
              </Field>

              <button
                onClick={() => {
                  if (!penName.trim() || !bio.trim()) {
                    setError("Pen name and bio are required.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full py-3.5 rounded-2xl bg-saffron text-white font-bold manga-border hover:bg-saffron/90 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                Continue <IconArrowRight size={16} />
              </button>

              {error && <p className="text-xs text-red-500 dark:text-red-400 text-center">{error}</p>}
            </div>
          )}

          {/* ── Step 2: Style & Links ── */}
          {step === 2 && (
            <div className="bg-white dark:bg-[#120D22] rounded-3xl p-6 border border-ink/5 dark:border-cream/5 flex flex-col gap-5">
              <div>
                <h2 className="font-display text-2xl text-ink dark:text-cream tracking-wide mb-1">Your Creative Style</h2>
                <p className="text-sm text-ink/45 dark:text-cream/40">Help readers find your work.</p>
              </div>

              <Field label="Genres You Create" hint={`${genres.length}/3`}>
                <div className="flex flex-wrap gap-2 mt-1">
                  {GENRES.map(({ name, Icon }) => {
                    const active = genres.includes(name);
                    const maxed = genres.length >= 3 && !active;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => !maxed && toggleGenre(name)}
                        disabled={maxed}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all ${
                          active
                            ? "border-saffron bg-saffron/10 text-saffron"
                            : "border-ink/10 dark:border-cream/10 text-ink/55 dark:text-cream/45 bg-white dark:bg-white/5"
                        } ${maxed ? "opacity-40 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
                      >
                        <Icon size={11} />
                        {name}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="border-t border-ink/5 dark:border-cream/5 pt-2">
                <p className="text-xs font-bold text-ink/40 dark:text-cream/35 uppercase tracking-wide mb-3">Your Links (optional)</p>
                <div className="flex flex-col gap-3">
                  <Field label="Portfolio / Website">
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yoursite.com"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Instagram">
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Twitter / X">
                    <input
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-2xl border-2 border-ink/15 dark:border-cream/15 text-ink/60 dark:text-cream/50 font-semibold text-sm hover:border-saffron/40 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => { setError(""); setStep(3); }}
                  className="flex-1 py-3.5 rounded-2xl bg-saffron text-white font-bold manga-border hover:bg-saffron/90 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  Continue <IconArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Legal Agreement ── */}
          {step === 3 && (
            <div className="bg-white dark:bg-[#120D22] rounded-3xl p-6 border border-ink/5 dark:border-cream/5 flex flex-col gap-5">
              <div>
                <h2 className="font-display text-2xl text-ink dark:text-cream tracking-wide mb-1">Review & Agree</h2>
                <p className="text-sm text-ink/45 dark:text-cream/40">Almost done — please read and accept the below.</p>
              </div>

              {/* Summary card */}
              <div className="rounded-2xl bg-saffron/5 dark:bg-saffron/8 border border-saffron/15 dark:border-saffron/20 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <IconBook size={14} className="text-saffron flex-shrink-0" />
                  <p className="text-xs font-bold text-saffron uppercase tracking-wide">Your Application</p>
                </div>
                <p className="text-sm font-bold text-ink dark:text-cream">{penName}</p>
                <p className="text-xs text-ink/50 dark:text-cream/50 line-clamp-2">{bio}</p>
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {genres.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-full bg-saffron/15 text-saffron text-[10px] font-semibold">{g}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <CheckboxItem id="terms" checked={termsAccepted} onChange={setTerms}>
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-saffron underline underline-offset-2 hover:text-saffron/80">
                    Terms of Service
                  </Link>
                </CheckboxItem>
                <CheckboxItem id="privacy" checked={privacyAccepted} onChange={setPrivacy}>
                  I have read and agree to the{" "}
                  <Link href="/privacy" target="_blank" className="text-saffron underline underline-offset-2 hover:text-saffron/80">
                    Privacy Policy
                  </Link>
                </CheckboxItem>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 rounded-2xl border-2 border-ink/15 dark:border-cream/15 text-ink/60 dark:text-cream/50 font-semibold text-sm hover:border-saffron/40 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={busy || !termsAccepted || !privacyAccepted}
                  className="flex-1 py-3.5 rounded-2xl bg-saffron text-white font-bold manga-border hover:bg-saffron/90 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {busy ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Application <IconArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-ink/30 dark:text-cream/30 text-center leading-relaxed">
                By submitting, your account will be upgraded to Creator status. You can start publishing immediately.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
