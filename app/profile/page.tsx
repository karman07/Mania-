"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/app/components/AuthProvider";
import { storage } from "@/app/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  IconPencil, IconChevronDown,
  IconSword, IconHeart, IconWand, IconShield,
  IconSmile, IconCoffee, IconSparkles, IconLandmark,
  IconArrowRight,
} from "@/app/components/Icons";

/* ─── types ──────────────────────────── */
type Country = { name: string; code: string; dialCode: string; flag: string };

/* ─── helpers ────────────────────────── */
function flagEmoji(iso: string) {
  try {
    return [...iso.toUpperCase()].map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397)).join("");
  } catch { return "🌐"; }
}

async function loadCountries(): Promise<Country[]> {
  const res = await fetch("https://raw.githubusercontent.com/mledoze/countries/master/countries.json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await res.json();
  return raw
    .filter((c) => c.idd?.root && c.name?.common && c.cca2)
    .map((c) => ({
      name: c.name.common as string,
      code: c.cca2 as string,
      dialCode: (c.idd.root as string) + ((c.idd.suffixes?.[0] as string) ?? ""),
      flag: flagEmoji(c.cca2),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ─── genre config ───────────────────── */
const GENRES = [
  { name: "Action",        Icon: IconSword,    sel: "border-red-400/70 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" },
  { name: "Romance",       Icon: IconHeart,    sel: "border-pink-400/70 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400" },
  { name: "Fantasy",       Icon: IconWand,     sel: "border-emerald-500/70 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" },
  { name: "Horror",        Icon: IconShield,   sel: "border-gray-400/70 bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300" },
  { name: "Comedy",        Icon: IconSmile,    sel: "border-yellow-400/70 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" },
  { name: "Slice of Life", Icon: IconCoffee,   sel: "border-amber-400/70 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" },
  { name: "Sci-Fi",        Icon: IconSparkles, sel: "border-blue-400/70 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
  { name: "Historical",    Icon: IconLandmark, sel: "border-amber-500/70 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" },
];

/* ─── sub-components ─────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#120D22] rounded-3xl p-6 border border-ink/5 dark:border-cream/5">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 dark:text-cream/35 mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-ink/55 dark:text-cream/45 uppercase tracking-wide">{label}</label>
        {hint && <span className="text-[10px] text-ink/30 dark:text-cream/30">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border-2 border-ink/10 dark:border-cream/10 bg-cream/60 dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/60 transition-colors";

/* Country picker */
function CountryPicker({
  countries, value, onChange,
}: { countries: Country[]; value: Country | null; onChange: (c: Country) => void }) {
  const [search, setSearch]  = useState("");
  const [open, setOpen]      = useState(false);
  const ref                  = useRef<HTMLDivElement>(null);
  const inputRef             = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  const filtered = countries
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search))
    .slice(0, 100);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-ink/10 dark:border-cream/10 bg-cream/60 dark:bg-white/5 hover:border-saffron/40 transition-colors text-left"
      >
        {value ? (
          <>
            <span className="text-lg leading-none">{value.flag}</span>
            <span className="flex-1 text-sm text-ink dark:text-cream">{value.name}</span>
            <span className="text-xs font-mono text-ink/40 dark:text-cream/40">{value.dialCode}</span>
          </>
        ) : (
          <span className="flex-1 text-sm text-ink/35 dark:text-cream/35">Select your country…</span>
        )}
        <IconChevronDown size={14} className={`text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl border-2 border-saffron/20 bg-cream dark:bg-[#0A0A0A] shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-saffron/10">
            <input
              ref={inputRef}
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country…"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-ink/10 dark:border-cream/10 text-ink dark:text-cream placeholder:text-ink/30 focus:outline-none focus:border-saffron/40"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code} type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-saffron/10 transition-colors text-left ${value?.code === c.code ? "bg-saffron/10" : ""}`}
              >
                <span className="text-base leading-none w-6">{c.flag}</span>
                <span className="flex-1 text-sm text-ink dark:text-cream">{c.name}</span>
                <span className="text-xs font-mono text-ink/40 dark:text-cream/40">{c.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Camera icon */
function IconCamera() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

/* Check icon */
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

/* ─── main page ──────────────────────── */
export default function ProfilePage() {
  const { user, firebaseUser, loading, updateProfile } = useAuth();
  const router = useRouter();

  /* form state */
  const [displayName, setDisplayName]     = useState("");
  const [username, setUsername]           = useState("");
  const [dob, setDob]                     = useState("");
  const [gender, setGender]               = useState("");
  const [country, setCountry]             = useState<Country | null>(null);
  const [phone, setPhone]                 = useState("");
  const [genres, setGenres]               = useState<string[]>([]);

  /* photo state */
  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [photoFile, setPhotoFile]         = useState<File | null>(null);
  const fileRef                           = useRef<HTMLInputElement>(null);

  /* countries */
  const [countries, setCountries]         = useState<Country[]>([]);
  const [loadingCt, setLoadingCt]         = useState(false);

  /* ui state */
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [error, setError]                 = useState("");

  /* redirect if not logged in */
  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  /* pre-fill from user */
  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setUsername(user.username ?? "");
    setDob(user.dob ?? "");
    setGender(user.gender ?? "");
    setPhone(user.phone ?? "");
    setGenres(user.favoriteGenres ?? []);
  }, [user]);

  /* load countries */
  useEffect(() => {
    setLoadingCt(true);
    loadCountries()
      .then((list) => {
        setCountries(list);
        if (user?.country) {
          const match = list.find((c) => c.name === user.country || c.code === user.countryCode);
          if (match) setCountry(match);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCt(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGenre = useCallback((name: string) => {
    setGenres((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : prev.length < 3 ? [...prev, name] : prev
    );
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB"); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSave() {
    if (!firebaseUser) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      let photoURL = user?.photoURL;

      /* upload photo if changed */
      if (photoFile) {
        try {
          const sRef = storageRef(storage, `profile-photos/${firebaseUser.uid}/avatar`);
          await uploadBytes(sRef, photoFile);
          photoURL = await getDownloadURL(sRef);
        } catch {
          setError("Photo upload failed — Firebase Storage may not be enabled. Other changes were saved.");
        }
      }

      await updateProfile({
        displayName: displayName.trim() || undefined,
        photoURL,
        username: username.trim() || undefined,
        dob: dob || undefined,
        gender: gender || undefined,
        country: country?.name || undefined,
        countryCode: country?.code || undefined,
        dialCode: country?.dialCode || undefined,
        phone: phone.trim() || undefined,
        favoriteGenres: genres,
        profileCompleted: true,
      });

      setSaved(true);
      setPhotoFile(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  const photoSrc = photoPreview ?? user?.photoURL ?? null;
  const initials = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
        <Navbar />
        <div className="pt-32 flex justify-center">
          <span className="w-8 h-8 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* breadcrumb */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-ink/45 dark:text-cream/40 hover:text-saffron transition-colors mb-6 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            Back to home
          </button>

          <div className="mb-8">
            <h1 className="font-display text-5xl text-ink dark:text-cream tracking-wider">
              Profile <span className="gradient-text">Settings</span>
            </h1>
            <p className="text-sm text-ink/45 dark:text-cream/40 mt-1">Manage your RaManga identity</p>
          </div>

          <div className="flex flex-col gap-4">

            {/* ── avatar card ── */}
            <Section title="Profile Photo">
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-saffron/30 bg-saffron/10 flex items-center justify-center">
                    {photoSrc ? (
                      <Image
                        src={photoSrc}
                        alt="avatar"
                        width={96} height={96}
                        className="w-full h-full object-cover"
                        unoptimized={photoSrc.startsWith("blob:")}
                      />
                    ) : (
                      <span className="font-display text-4xl text-saffron">{initials}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-saffron text-white flex items-center justify-center shadow-lg hover:bg-saffron/90 transition-all hover:scale-110"
                  >
                    <IconCamera />
                  </button>
                  <input
                    ref={fileRef}
                    type="file" accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div>
                  <p className="font-bold text-base text-ink dark:text-cream">{user.displayName || "No name set"}</p>
                  <p className="text-sm text-ink/45 dark:text-cream/40">{user.email}</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 text-xs font-semibold text-saffron hover:underline flex items-center gap-1"
                  >
                    <IconCamera />
                    Change photo
                  </button>
                  <p className="text-[10px] text-ink/30 dark:text-cream/30 mt-0.5">Max 5 MB · JPG, PNG, WebP</p>
                </div>
              </div>
            </Section>

            {/* ── basic info ── */}
            <Section title="Basic Information">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Display Name">
                    <input
                      type="text" value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your full name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Username" hint="visible publicly">
                    <input
                      type="text" value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@handle"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Email" hint="from sign-in">
                  <input
                    type="email" value={user.email}
                    disabled
                    className={`${inputCls} opacity-50 cursor-not-allowed`}
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
              </div>
            </Section>

            {/* ── location & contact ── */}
            <Section title="Location & Contact">
              <div className="flex flex-col gap-4">
                <Field label="Country">
                  {loadingCt ? (
                    <div className={`${inputCls} flex items-center gap-2 text-ink/40 dark:text-cream/40`}>
                      <span className="w-3 h-3 rounded-full border-2 border-saffron border-t-transparent animate-spin flex-shrink-0" />
                      Loading countries…
                    </div>
                  ) : (
                    <CountryPicker countries={countries} value={country} onChange={setCountry} />
                  )}
                </Field>

                <Field label="Phone Number" hint="optional">
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center min-w-[72px] px-3 py-2.5 rounded-xl border-2 border-ink/10 dark:border-cream/10 bg-cream/60 dark:bg-white/5 text-sm font-mono text-ink/55 dark:text-cream/45 select-none">
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
              </div>
            </Section>

            {/* ── creator status ── */}
            <Section title="Creator Status">
              {user.role === "creator" ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/15 border-2 border-gold/30 flex items-center justify-center flex-shrink-0">
                    <IconPencil size={22} className="text-gold dark:text-gold-light" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-ink dark:text-cream">You&apos;re a Creator</p>
                    <p className="text-xs text-ink/45 dark:text-cream/40 mt-0.5">Publish manga and grow your audience on RaManga</p>
                  </div>
                  <a
                    href="/creator/portal"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-saffron text-white text-xs font-bold hover:bg-saffron/90 transition-all flex-shrink-0"
                  >
                    Portal <IconArrowRight size={12} />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-ink/5 dark:bg-cream/5 border-2 border-ink/10 dark:border-cream/10 flex items-center justify-center flex-shrink-0">
                    <IconPencil size={22} className="text-ink/30 dark:text-cream/30" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-ink dark:text-cream">Become a Creator</p>
                    <p className="text-xs text-ink/45 dark:text-cream/40 mt-0.5">Publish your manga, build an audience, and earn — completely free</p>
                  </div>
                  <a
                    href="/creator/onboard"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-saffron/40 text-saffron dark:text-saffron-bright text-xs font-bold hover:bg-saffron/10 transition-all flex-shrink-0 whitespace-nowrap"
                  >
                    Apply <IconArrowRight size={12} />
                  </a>
                </div>
              )}
            </Section>

            {/* ── favourite genres ── */}
            <Section title="Favourite Genres">
              <p className="text-xs text-ink/40 dark:text-cream/40 mb-3">{genres.length}/3 selected</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(({ name, Icon, sel }) => {
                  const active = genres.includes(name);
                  const maxed  = genres.length >= 3 && !active;
                  return (
                    <button
                      key={name} type="button"
                      onClick={() => !maxed && toggleGenre(name)}
                      disabled={maxed}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-xs font-semibold transition-all ${
                        active
                          ? sel
                          : "border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink/55 dark:text-cream/45"
                      } ${maxed ? "opacity-35 cursor-not-allowed" : "hover:scale-105 active:scale-95 cursor-pointer"}`}
                    >
                      <Icon size={12} />
                      {name}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* ── error / success ── */}
            {error && (
              <div className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {saved && (
              <div className="px-4 py-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <IconCheck />
                Profile saved successfully!
              </div>
            )}

            {/* ── save button ── */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-saffron text-white font-bold text-base manga-border hover:bg-saffron/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-saffron/25"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Save Changes
                  <IconArrowRight size={16} />
                </>
              )}
            </button>

          </div>
        </div>
      </main>

    </div>
  );
}
