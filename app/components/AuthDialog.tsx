"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth, ERR_UNVERIFIED, ERR_VERIFY_SENT } from "./AuthProvider";
import {
  IconChevronDown,
  IconSword, IconHeart, IconWand, IconShield,
  IconSmile, IconCoffee, IconSparkles, IconLandmark,
} from "./Icons";

/* ─── types ──────────────────────────────────────── */
type View      = "auth" | "reset" | "unverified" | "profile";
type AuthMode  = "signin" | "signup";
type Country   = { name: string; code: string; dialCode: string; flag: string };

/* ─── firebase error map ─────────────────────────── */
function parseFirebaseError(message: string): string {
  const code = message.match(/\(auth\/(.*?)\)/)?.[1] ?? "";
  const map: Record<string, string> = {
    "user-not-found":          "No account found with this email address.",
    "wrong-password":          "Incorrect password. Try again or use Forgot Password.",
    "invalid-credential":      "Incorrect email or password.",
    "too-many-requests":       "Too many failed attempts. Please wait a moment before trying again.",
    "email-already-in-use":    "An account with this email already exists. Sign in instead.",
    "weak-password":           "Password must be at least 6 characters long.",
    "invalid-email":           "Please enter a valid email address.",
    "network-request-failed":  "Network error. Check your connection and try again.",
    "user-disabled":           "This account has been disabled. Contact support.",
    "operation-not-allowed":   "Email/password sign-in is not enabled.",
  };
  return map[code] ?? message.replace("Firebase: ", "").replace(/\s*\(auth\/.*?\)\.?\s*/g, "").trim();
}

/* ─── helpers ────────────────────────────────────── */
function flagEmoji(iso: string) {
  try {
    return [...iso.toUpperCase()].map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397)).join("");
  } catch { return "🌐"; }
}

async function loadCountries(): Promise<Country[]> {
  const res  = await fetch("https://raw.githubusercontent.com/mledoze/countries/master/countries.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await res.json();
  return raw
    .filter((c) => c.idd?.root && c.name?.common && c.cca2)
    .map((c) => ({
      name:     c.name.common as string,
      code:     c.cca2 as string,
      dialCode: (c.idd.root as string) + ((c.idd.suffixes?.[0] as string) ?? ""),
      flag:     flagEmoji(c.cca2),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ─── genre config ───────────────────────────────── */
const GENRES = [
  { name: "Action",        Icon: IconSword,    sel: "border-red-400/70 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",       idle: "border-ink/10 dark:border-cream/10" },
  { name: "Romance",       Icon: IconHeart,    sel: "border-pink-400/70 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",   idle: "border-ink/10 dark:border-cream/10" },
  { name: "Fantasy",       Icon: IconWand,     sel: "border-emerald-500/70 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400", idle: "border-ink/10 dark:border-cream/10" },
  { name: "Horror",        Icon: IconShield,   sel: "border-gray-400/70 bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300",  idle: "border-ink/10 dark:border-cream/10" },
  { name: "Comedy",        Icon: IconSmile,    sel: "border-yellow-400/70 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400", idle: "border-ink/10 dark:border-cream/10" },
  { name: "Slice of Life", Icon: IconCoffee,   sel: "border-amber-400/70 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400", idle: "border-ink/10 dark:border-cream/10" },
  { name: "Sci-Fi",        Icon: IconSparkles, sel: "border-blue-400/70 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",   idle: "border-ink/10 dark:border-cream/10" },
  { name: "Historical",    Icon: IconLandmark, sel: "border-amber-500/70 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400", idle: "border-ink/10 dark:border-cream/10" },
];

/* ─── small components ───────────────────────────── */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-ink/60 dark:text-cream/50 uppercase tracking-wide">{label}</span>
        {hint && <span className="text-[10px] text-ink/30 dark:text-cream/30">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-500 flex-shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{message}</p>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/60 transition-colors";

/* country picker */
function CountryPicker({ countries, value, onChange }: {
  countries: Country[]; value: Country | null; onChange: (c: Country) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search)
  ).slice(0, 100);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 hover:border-saffron/40 transition-colors text-left"
      >
        {value ? (
          <>
            <span className="text-lg leading-none">{value.flag}</span>
            <span className="flex-1 text-sm text-ink dark:text-cream">{value.name}</span>
            <span className="text-xs font-mono text-ink/50 dark:text-cream/40">{value.dialCode}</span>
          </>
        ) : (
          <span className="flex-1 text-sm text-ink/40 dark:text-cream/40">Select your country…</span>
        )}
        <IconChevronDown size={14} className={`text-ink/40 dark:text-cream/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border-2 border-saffron/20 bg-cream dark:bg-[#120D22] shadow-2xl z-[300] overflow-hidden">
          <div className="p-2 border-b border-saffron/10">
            <input
              ref={inputRef} type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code…"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-ink/10 dark:border-cream/10 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 focus:outline-none focus:border-saffron/40"
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0
              ? <p className="px-4 py-3 text-sm text-ink/40 dark:text-cream/40">No results</p>
              : filtered.map((c) => (
                  <button
                    key={c.code} type="button"
                    onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-saffron/10 transition-colors text-left ${value?.code === c.code ? "bg-saffron/10" : ""}`}
                  >
                    <span className="text-base leading-none w-6">{c.flag}</span>
                    <span className="flex-1 text-sm text-ink dark:text-cream">{c.name}</span>
                    <span className="text-xs font-mono text-ink/40 dark:text-cream/40">{c.dialCode}</span>
                  </button>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* genre chips */
function GenreChips({ selected, toggle }: { selected: string[]; toggle: (n: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map(({ name, Icon, sel, idle }) => {
        const active = selected.includes(name);
        const maxed  = selected.length >= 3 && !active;
        return (
          <button
            key={name} type="button"
            onClick={() => !maxed && toggle(name)}
            disabled={maxed}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all ${
              active ? sel : `${idle} text-ink/60 dark:text-cream/50 bg-white dark:bg-white/5`
            } ${maxed ? "opacity-40 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
          >
            <Icon size={12} />
            {name}
          </button>
        );
      })}
    </div>
  );
}

/* ─── main dialog ────────────────────────────────── */
export default function AuthDialog() {
  const {
    dialogOpen, closeDialog,
    signInWithGoogle, signInWithEmail, signUpWithEmail,
    resendVerificationEmail, sendPasswordReset,
    updateProfile,
  } = useAuth();

  const [view, setView]         = useState<View>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  /* auth fields */
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);

  /* pending creds — kept so resend / retry can use them */
  const [pendingEmail, setPendingEmail]       = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  /* reset */
  const [resetSent, setResetSent] = useState(false);

  /* profile fields */
  const [username, setUsername]   = useState("");
  const [dob, setDob]             = useState("");
  const [gender, setGender]       = useState("");
  const [country, setCountry]     = useState<Country | null>(null);
  const [phone, setPhone]         = useState("");
  const [genres, setGenres]       = useState<string[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCt, setLoadingCt] = useState(false);

  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  /* load countries when profile view opens */
  useEffect(() => {
    if (view === "profile" && countries.length === 0 && !loadingCt) {
      setLoadingCt(true);
      loadCountries().then(setCountries).catch(() => {}).finally(() => setLoadingCt(false));
    }
  }, [view, countries.length, loadingCt]);

  /* reset all state when dialog opens */
  useEffect(() => {
    if (dialogOpen) {
      setView("auth"); setAuthMode("signin");
      setEmail(""); setPassword(""); setShowPw(false);
      setPendingEmail(""); setPendingPassword("");
      setResetSent(false);
      setUsername(""); setDob(""); setGender("");
      setCountry(null); setPhone(""); setGenres([]);
      setError(""); setResendDone(false);
    }
  }, [dialogOpen]);

  /* ESC key */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") closeDialog(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [closeDialog]);

  /* body scroll lock */
  useEffect(() => {
    document.body.style.overflow = dialogOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [dialogOpen]);

  const toggleGenre = useCallback((name: string) => {
    setGenres((prev) => prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]);
  }, []);

  if (!dialogOpen) return null;

  /* ── handlers ── */
  async function handleGoogleSignIn() {
    setBusy(true); setError("");
    try {
      const u = await signInWithGoogle();
      u.profileCompleted ? closeDialog() : setView("profile");
    } catch (e: unknown) {
      setError(parseFirebaseError(e instanceof Error ? e.message : "Google sign-in failed"));
    } finally { setBusy(false); }
  }

  async function handleEmailAuth() {
    if (!email.trim() || !password) { setError("Please fill in both email and password."); return; }
    setBusy(true); setError("");
    try {
      if (authMode === "signup") {
        await signUpWithEmail(email.trim(), password);
      } else {
        const u = await signInWithEmail(email.trim(), password);
        u.profileCompleted ? closeDialog() : setView("profile");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === ERR_VERIFY_SENT) {
        setPendingEmail(email.trim());
        setPendingPassword(password);
        setView("unverified");
      } else if (msg === ERR_UNVERIFIED) {
        setPendingEmail(email.trim());
        setPendingPassword(password);
        setView("unverified");
      } else {
        setError(parseFirebaseError(msg));
      }
    } finally { setBusy(false); }
  }

  async function handleRetrySignIn() {
    if (!pendingEmail || !pendingPassword) { setView("auth"); return; }
    setBusy(true); setError("");
    try {
      const u = await signInWithEmail(pendingEmail, pendingPassword);
      u.profileCompleted ? closeDialog() : setView("profile");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === ERR_UNVERIFIED) {
        setError("Email still not verified. Please check your inbox and click the link first.");
      } else {
        setError(parseFirebaseError(msg));
      }
    } finally { setBusy(false); }
  }

  async function handleResend() {
    if (!pendingEmail || !pendingPassword) return;
    setResendBusy(true);
    try {
      await resendVerificationEmail(pendingEmail, pendingPassword);
      setResendDone(true);
    } catch {
      /* silently ignore — user may have already verified */
    } finally { setResendBusy(false); }
  }

  async function handlePasswordReset() {
    if (!email.trim()) { setError("Enter your email address first."); return; }
    setBusy(true); setError("");
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
    } catch (e: unknown) {
      setError(parseFirebaseError(e instanceof Error ? e.message : "Failed to send reset email"));
    } finally { setBusy(false); }
  }

  async function handleProfileSave(skip = false) {
    setBusy(true); setError("");
    try {
      await updateProfile({
        role: "reader",
        ...(skip ? {} : {
          username: username.trim() || undefined,
          dob:      dob || undefined,
          gender:   gender || undefined,
          country:  country?.name || undefined,
          countryCode: country?.code || undefined,
          dialCode: country?.dialCode || undefined,
          phone:    phone.trim() || undefined,
          favoriteGenres: genres,
        }),
        profileCompleted: !skip,
      });
      closeDialog();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally { setBusy(false); }
  }

  /* ── shell ── */
  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) closeDialog(); }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(10,6,20,0.85)", backdropFilter: "blur(10px)" }}
    >
      <div
        className="relative w-full max-w-[440px] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "92vh",
          background: "var(--color-cream)",
          border: "2px solid rgba(230,100,20,0.15)",
          animation: "dialogIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* top accent bar */}
        <div className="h-1 flex-shrink-0" style={{ background: "linear-gradient(90deg,#E65C14,#F7C948,#E65C14)" }} />

        {/* close button */}
        <button
          onClick={closeDialog}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-ink/30 hover:text-saffron hover:bg-saffron/10 transition-all z-10"
        >
          <CloseIcon />
        </button>

        <div className="overflow-y-auto flex-1 dark:bg-[#0A0A0A] bg-cream">
          <div className="px-7 pt-7 pb-8">

            {/* ══════ VIEW: AUTH (sign in / sign up) ══════ */}
            {view === "auth" && (
              <div>
                <div className="text-center mb-7">
                  <span className="font-display text-4xl gradient-text tracking-wider">RaManga</span>
                  <p className="mt-1 text-[11px] text-ink/40 dark:text-cream/40 uppercase tracking-widest font-semibold">
                    {authMode === "signin" ? "Welcome back" : "Create your account"}
                  </p>
                </div>

                <button
                  onClick={handleGoogleSignIn} disabled={busy}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 hover:border-saffron/40 hover:bg-saffron/5 text-ink dark:text-cream font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 mb-5 shadow-sm"
                >
                  <GoogleLogo />
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <span className="flex-1 h-px bg-ink/8 dark:bg-cream/8" />
                  <span className="text-xs text-ink/35 dark:text-cream/35 font-medium">or</span>
                  <span className="flex-1 h-px bg-ink/8 dark:bg-cream/8" />
                </div>

                <div className="flex flex-col gap-3">
                  <Field label="Email">
                    <input
                      type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                      placeholder="you@example.com"
                      className={inputCls}
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                        placeholder="••••••••"
                        className={`${inputCls} pr-11`}
                        autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                      />
                      <button
                        type="button" onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-saffron transition-colors"
                      >
                        <EyeIcon show={showPw} />
                      </button>
                    </div>

                    {authMode === "signin" && (
                      <div className="flex justify-end mt-1.5">
                        <button
                          type="button"
                          onClick={() => { setView("reset"); setError(""); setResetSent(false); }}
                          className="text-[11px] text-ink/40 dark:text-cream/35 hover:text-saffron transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </Field>

                  <ErrorBox message={error} />

                  <button
                    onClick={handleEmailAuth} disabled={busy}
                    className="w-full py-3 rounded-2xl bg-saffron text-white font-bold text-sm manga-border hover:bg-saffron/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 mt-1"
                  >
                    {busy ? "Please wait…" : authMode === "signin" ? "Sign In" : "Create Account"}
                  </button>
                </div>

                <p className="text-center text-xs text-ink/40 dark:text-cream/40 mt-5">
                  {authMode === "signin" ? "New to RaManga?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setError(""); }}
                    className="text-saffron font-semibold hover:underline"
                  >
                    {authMode === "signin" ? "Create account" : "Sign in"}
                  </button>
                </p>
              </div>
            )}

            {/* ══════ VIEW: RESET PASSWORD ══════ */}
            {view === "reset" && (
              <div className="flex flex-col items-center">
                {!resetSent ? (
                  <>
                    <img
                      src="/forgot_pass.png"
                      alt="Forgot password"
                      className="w-36 h-36 object-contain mb-2"
                    />
                    <h2 className="font-display text-2xl text-ink dark:text-cream tracking-wide text-center mb-1">
                      Forgot your password?
                    </h2>
                    <p className="text-sm text-ink/50 dark:text-cream/45 text-center mb-6 leading-relaxed max-w-[280px]">
                      Enter your email address and we will send you a link to reset your password.
                    </p>

                    <div className="w-full flex flex-col gap-3">
                      <Field label="Email address">
                        <input
                          type="email" value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handlePasswordReset()}
                          placeholder="you@example.com"
                          className={inputCls}
                          autoFocus
                        />
                      </Field>
                      <ErrorBox message={error} />
                      <button
                        onClick={handlePasswordReset} disabled={busy}
                        className="w-full py-3 rounded-2xl bg-saffron text-white font-bold text-sm manga-border hover:bg-saffron/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                      >
                        {busy ? "Sending…" : "Send Reset Link"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src="/forgot_pass.png"
                      alt="Email sent"
                      className="w-44 h-44 object-contain mb-2"
                    />
                    <h2 className="font-display text-2xl text-ink dark:text-cream tracking-wide text-center mb-2">
                      Check your inbox
                    </h2>
                    <p className="text-sm text-ink/50 dark:text-cream/45 text-center leading-relaxed max-w-[290px] mb-1">
                      We sent a password reset link to
                    </p>
                    <p className="text-sm font-bold text-ink dark:text-cream text-center mb-6">{email}</p>
                    <div className="w-full rounded-2xl bg-saffron/8 dark:bg-saffron/12 border border-saffron/20 px-4 py-3 text-xs text-ink/55 dark:text-cream/50 leading-relaxed text-center mb-4">
                      Did not receive it? Check your spam folder, or try again in a few minutes.
                    </div>
                    <button
                      onClick={() => setResetSent(false)}
                      className="text-sm text-saffron font-semibold hover:underline"
                    >
                      Resend email
                    </button>
                  </>
                )}

                <button
                  onClick={() => { setView("auth"); setError(""); }}
                  className="mt-5 text-xs text-ink/40 dark:text-cream/35 hover:text-saffron transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to sign in
                </button>
              </div>
            )}

            {/* ══════ VIEW: EMAIL NOT VERIFIED ══════ */}
            {view === "unverified" && (
              <div className="flex flex-col items-center">
                <img
                  src="/verify_mail.png"
                  alt="Verify your email"
                  className="w-40 h-40 object-contain mb-3"
                />
                <h2 className="font-display text-2xl text-ink dark:text-cream tracking-wide text-center mb-2">
                  Verify your email
                </h2>
                <p className="text-sm text-ink/50 dark:text-cream/45 text-center leading-relaxed mb-1 max-w-[290px]">
                  We sent a verification link to
                </p>
                <p className="text-sm font-bold text-ink dark:text-cream text-center mb-5">
                  {pendingEmail}
                </p>

                <div className="w-full rounded-2xl border border-ink/8 dark:border-cream/8 bg-ink/3 dark:bg-cream/3 px-4 py-4 mb-5">
                  {[
                    "Open the email we sent you",
                    "Click the verification link inside",
                    "Come back and sign in below",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                      <div className="w-5 h-5 rounded-full bg-saffron/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-saffron">{i + 1}</span>
                      </div>
                      <p className="text-xs text-ink/60 dark:text-cream/55 leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>

                <ErrorBox message={error} />

                <div className="w-full flex flex-col gap-3 mt-3">
                  <button
                    onClick={handleRetrySignIn} disabled={busy}
                    className="w-full py-3 rounded-2xl bg-saffron text-white font-bold text-sm manga-border hover:bg-saffron/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {busy ? "Checking…" : "I have verified — Sign In"}
                  </button>

                  {resendDone ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Verification email resent</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleResend} disabled={resendBusy}
                      className="w-full py-3 rounded-2xl border-2 border-ink/12 dark:border-cream/12 text-ink/65 dark:text-cream/55 font-semibold text-sm hover:border-saffron/40 hover:text-saffron transition-all disabled:opacity-50"
                    >
                      {resendBusy ? "Sending…" : "Resend verification email"}
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-ink/35 dark:text-cream/30 text-center mt-4">
                  Check your spam folder if you do not see the email.
                </p>

                <button
                  onClick={() => { setView("auth"); setError(""); setPendingEmail(""); setPendingPassword(""); }}
                  className="mt-4 text-xs text-ink/40 dark:text-cream/35 hover:text-saffron transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Use a different account
                </button>
              </div>
            )}

            {/* ══════ VIEW: PROFILE SETUP ══════ */}
            {view === "profile" && (
              <div>
                <div className="flex items-center gap-1 mb-5">
                  <span className="h-1.5 w-6 rounded-full bg-saffron" />
                </div>
                <h2 className="font-display text-3xl text-ink dark:text-cream tracking-wider leading-tight">
                  Your profile
                </h2>
                <p className="text-sm text-ink/45 dark:text-cream/40 mt-1 mb-6">
                  All fields are optional — fill what feels right.
                </p>

                <div className="flex flex-col gap-4">
                  <Field label="Username" hint="visible to others">
                    <input
                      type="text" value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@your_handle"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date of Birth" hint="for age ratings">
                      <input
                        type="date" value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={inputCls}
                        style={{ colorScheme: "light dark" }}
                      />
                    </Field>
                    <Field label="Gender">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={`${inputCls} appearance-none`}
                      >
                        <option value="">Select…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Country">
                    {loadingCt ? (
                      <div className={`${inputCls} text-ink/40 flex items-center gap-2`}>
                        <span className="w-3 h-3 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
                        Loading countries…
                      </div>
                    ) : (
                      <CountryPicker countries={countries} value={country} onChange={setCountry} />
                    )}
                  </Field>

                  <Field label="Phone Number" hint="optional">
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center min-w-[68px] px-3 py-2.5 rounded-xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-sm font-mono text-ink/60 dark:text-cream/50 select-none">
                        {country?.dialCode ?? "+—"}
                      </div>
                      <input
                        type="tel" value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className={`${inputCls} flex-1`}
                      />
                    </div>
                  </Field>

                  <Field label="Favourite Genres" hint={`${genres.length}/3 selected`}>
                    <GenreChips selected={genres} toggle={toggleGenre} />
                  </Field>

                  <ErrorBox message={error} />

                  <button
                    onClick={() => handleProfileSave(false)} disabled={busy}
                    className="w-full py-3 rounded-2xl bg-saffron text-white font-bold text-sm manga-border hover:bg-saffron/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 mt-1"
                  >
                    {busy ? "Saving…" : "Complete Profile"}
                  </button>

                  <button
                    onClick={() => handleProfileSave(true)} disabled={busy}
                    className="text-center text-xs text-ink/35 dark:text-cream/35 hover:text-saffron transition-colors disabled:opacity-50"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.93) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
