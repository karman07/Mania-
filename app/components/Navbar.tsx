"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";
import { useAuth } from "./AuthProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  IconSearch, IconSun, IconMoon, IconArrowRight,
  IconSword, IconHeart, IconWand, IconShield,
  IconSmile, IconCoffee, IconSparkles, IconLandmark,
} from "./Icons";

const GENRES = [
  { name: "Action",        Icon: IconSword,    q: "Action"        },
  { name: "Romance",       Icon: IconHeart,    q: "Romance"       },
  { name: "Fantasy",       Icon: IconWand,     q: "Fantasy"       },
  { name: "Horror",        Icon: IconShield,   q: "Horror"        },
  { name: "Comedy",        Icon: IconSmile,    q: "Comedy"        },
  { name: "Slice of Life", Icon: IconCoffee,   q: "Slice+of+Life" },
  { name: "Sci-Fi",        Icon: IconSparkles, q: "Sci-Fi"        },
  { name: "Historical",    Icon: IconLandmark, q: "Historical"    },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function UserMenu({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+10px)] w-52 rounded-2xl border border-saffron/15 dark:border-cream/10 bg-cream dark:bg-[#111111] shadow-xl shadow-ink/10 dark:shadow-ink/40 overflow-hidden z-[60]"
      style={{ animation: "dropIn 0.16s cubic-bezier(0.34,1.4,0.64,1)" }}
    >
      <div className="px-4 py-3 border-b border-saffron/10 dark:border-cream/5">
        <p className="text-xs font-bold text-ink dark:text-cream truncate">{user?.displayName || user?.email}</p>
        <p className="text-[10px] text-ink/40 dark:text-cream/40 mt-0.5 capitalize">{user?.role ?? "Member"}</p>
      </div>

      <div className="py-1.5">
        <UserMenuItem href="/browse"  onClick={onClose}>My Library</UserMenuItem>
        <UserMenuItem href="/profile" onClick={onClose}>Profile Settings</UserMenuItem>
        {user?.role === "creator" && (
          <UserMenuItem href="/creator/portal" onClick={onClose} accent>Creator Portal</UserMenuItem>
        )}
      </div>

      <div className="border-t border-saffron/10 dark:border-cream/5 py-1.5">
        <button
          onClick={() => { signOut(); onClose(); }}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function UserMenuItem({
  href, onClick, children, accent, muted,
}: {
  href: string; onClick: () => void; children: React.ReactNode; accent?: boolean; muted?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2 text-sm transition-colors hover:bg-saffron/5 dark:hover:bg-saffron/10 ${
        accent ? "font-semibold text-saffron dark:text-saffron-bright"
        : muted  ? "text-xs text-ink/40 dark:text-cream/35 hover:text-ink/65 dark:hover:text-cream/55"
        : "text-ink/70 dark:text-cream/60 hover:text-saffron dark:hover:text-saffron-bright"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { user, loading, openDialog, signOut } = useAuth();
  const pathname  = usePathname();
  const router    = useRouter();
  const isLanding = pathname === "/";

  const [scrolled, setScrolled]           = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [genreOpen, setGenreOpen]         = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [mobileGenreOpen, setMobileGenreOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const genreRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false); setSearchQuery("");
        setGenreOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!genreOpen) return;
    const h = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) setGenreOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [genreOpen]);


  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/browse?q=${encodeURIComponent(q)}`);
    setSearchOpen(false); setSearchQuery("");
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const avatarUrl = user?.photoURL;
  const initials  = user?.displayName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? "?";

  const linkCls = "text-sm font-semibold text-ink/70 dark:text-cream/70 hover:text-saffron dark:hover:text-saffron-bright transition-colors";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isLanding
          ? "bg-cream/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md shadow-sm border-b border-saffron/10 dark:border-cream/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {/* Light mode logo */}
            <Image
              src="/ramanga_logo-great.png"
              alt="RaManga"
              width={120}
              height={120}
              className="h-14 md:h-16 w-auto object-contain dark:hidden"
              priority
            />
            {/* Dark mode logo */}
            <Image
              src="/ramanga_logo_black.png"
              alt="RaManga"
              width={120}
              height={120}
              className="h-14 md:h-16 w-auto object-contain hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop links */}
          {!searchOpen && (
            <div className="hidden md:flex items-center gap-7">

              <Link href="/" className={linkCls}>Home</Link>

              <Link href="/browse" className={linkCls}>{t.nav.browse}</Link>

              {/* Genres — single dropdown */}
              <div ref={genreRef} className="relative">
                <button
                  onClick={() => setGenreOpen((v) => !v)}
                  className={`${linkCls} flex items-center gap-1`}
                >
                  Genres
                  <Chevron open={genreOpen} />
                </button>

                {genreOpen && (
                  <div
                    className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-64 rounded-2xl border border-saffron/15 dark:border-cream/10 bg-cream dark:bg-[#111111] shadow-xl shadow-ink/10 dark:shadow-ink/40 overflow-hidden z-[60] p-2 grid grid-cols-2 gap-0.5"
                    style={{ animation: "dropIn 0.16s cubic-bezier(0.34,1.4,0.64,1)" }}
                  >
                    {GENRES.map(({ name, Icon, q }) => (
                      <Link
                        key={name}
                        href={`/browse?genre=${q}`}
                        onClick={() => setGenreOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink/65 dark:text-cream/55 hover:text-saffron dark:hover:text-saffron-bright hover:bg-saffron/6 dark:hover:bg-saffron/10 transition-all"
                      >
                        <Icon size={12} className="text-saffron/60 flex-shrink-0" />
                        {name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/creators" className={linkCls}>{t.nav.creators}</Link>
              <Link href="/terms"    className={linkCls}>Terms</Link>
              <Link href="/privacy"  className={linkCls}>Privacy</Link>

            </div>
          )}

          {/* Inline search */}
          {searchOpen && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 items-center gap-2 mx-4">
              <div className="relative flex-1">
                <IconSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 dark:text-cream/30 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manga, authors..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-saffron/30 focus:border-saffron bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none transition-colors"
                />
              </div>
              <button type="submit" className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-saffron text-white text-sm font-semibold hover:bg-saffron/90 transition-all">
                Search <IconArrowRight size={14} />
              </button>
            </form>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              aria-label={searchOpen ? "Close search" : "Search"}
              onClick={() => { setSearchOpen((v) => !v); setSearchQuery(""); setGenreOpen(false); }}
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-ink/60 dark:text-cream/60 hover:text-saffron hover:bg-saffron/10 transition-all"
            >
              {searchOpen ? (
                <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <IconSearch size={17} />
              )}
            </button>

            <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-saffron/30 dark:border-saffron-bright/30 hover:border-saffron hover:bg-saffron/10 text-ink dark:text-cream transition-all"
            >
              {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>

            {!loading && (
              user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="w-9 h-9 rounded-full border-2 border-saffron/50 overflow-hidden flex items-center justify-center bg-saffron/10 hover:border-saffron transition-all"
                  >
                    {avatarUrl
                      ? <Image src={avatarUrl} alt="avatar" width={36} height={36} className="object-cover w-full h-full" />
                      : <span className="text-sm font-bold text-saffron">{initials}</span>
                    }
                  </button>
                  {userMenuOpen && <UserMenu onClose={() => setUserMenuOpen(false)} />}
                </div>
              ) : (
                <button
                  onClick={openDialog}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-saffron text-white text-sm font-semibold hover:bg-saffron/90 transition-all manga-border hover:shadow-lg hover:shadow-saffron/30 active:scale-95"
                >
                  Sign In
                </button>
              )
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-ink dark:bg-cream transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-ink dark:bg-cream transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-ink dark:bg-cream transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        } bg-cream dark:bg-[#0A0A0A] border-t border-saffron/20`}
      >
        <div className="px-5 py-4 flex flex-col gap-1">
          {/* Search */}
          <form onSubmit={(e) => { handleSearchSubmit(e); closeMenu(); }} className="relative mb-3">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30 dark:text-cream/30 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manga..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/50 transition-colors"
            />
          </form>

          <Link href="/"         onClick={closeMenu} className="py-2.5 text-base font-semibold text-ink/80 dark:text-cream/80 hover:text-saffron transition-colors">Home</Link>
          <Link href="/browse"   onClick={closeMenu} className="py-2.5 text-base font-semibold text-ink/80 dark:text-cream/80 hover:text-saffron transition-colors">{t.nav.browse}</Link>

          {/* Genres accordion */}
          <div>
            <button
              onClick={() => setMobileGenreOpen((v) => !v)}
              className="w-full flex items-center justify-between py-2.5 text-base font-semibold text-ink/80 dark:text-cream/80 hover:text-saffron transition-colors"
            >
              Genres
              <Chevron open={mobileGenreOpen} />
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${mobileGenreOpen ? "max-h-64 pb-2" : "max-h-0"}`}>
              <div className="grid grid-cols-2 gap-0.5 pl-2">
                {GENRES.map(({ name, Icon, q }) => (
                  <Link
                    key={name}
                    href={`/browse?genre=${q}`}
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-2 py-2 text-sm text-ink/60 dark:text-cream/50 hover:text-saffron transition-colors"
                  >
                    <Icon size={12} className="text-saffron/60 flex-shrink-0" />
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/creators" onClick={closeMenu} className="py-2.5 text-base font-semibold text-ink/80 dark:text-cream/80 hover:text-saffron transition-colors">{t.nav.creators}</Link>

          <div className="border-t border-saffron/10 dark:border-cream/10 mt-1 pt-2 flex flex-col gap-0.5">
            <Link href="/terms"   onClick={closeMenu} className="py-1.5 text-sm text-ink/45 dark:text-cream/40 hover:text-saffron transition-colors">Terms of Service</Link>
            <Link href="/privacy" onClick={closeMenu} className="py-1.5 text-sm text-ink/45 dark:text-cream/40 hover:text-saffron transition-colors">Privacy Policy</Link>
          </div>

          {/* Auth row */}
          <div className="flex items-center gap-3 pt-3 mt-1 border-t border-saffron/10 dark:border-cream/10">
            {user ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full border-2 border-saffron/40 overflow-hidden flex items-center justify-center bg-saffron/10 flex-shrink-0">
                  {avatarUrl
                    ? <Image src={avatarUrl} alt="avatar" width={32} height={32} className="object-cover w-full h-full" />
                    : <span className="text-xs font-bold text-saffron">{initials}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink dark:text-cream truncate">{user.displayName || user.email}</p>
                  <div className="flex gap-3 mt-0.5">
                    <Link href="/profile" onClick={closeMenu} className="text-[11px] text-saffron hover:underline">Profile</Link>
                    <button onClick={() => { signOut(); closeMenu(); }} className="text-[11px] text-red-500 hover:underline">Sign out</button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { openDialog(); closeMenu(); }}
                className="flex-1 py-2.5 rounded-full bg-saffron text-white font-semibold text-sm manga-border"
              >
                Sign In Free
              </button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </nav>
  );
}
