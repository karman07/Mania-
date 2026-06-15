"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, loading, openDialog, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const avatarUrl = user?.photoURL;
  const initials = user?.displayName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? "?";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/browse?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <h1 className="text-4xl font-bold italic text-purple-400">RaManga</h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          <Link href="/" className="text-white font-medium">Home</Link>
          <Link href="/browse" className="text-gray-400 hover:text-white transition">Browse</Link>
          <Link href="/creators" className="text-gray-400 hover:text-white transition">Creators</Link>
          <Link href="/creator/onboard" className="text-gray-400 hover:text-white transition">Write</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-[220px] focus-within:border-purple-500/50 transition"
          >
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manga..."
              className="bg-transparent outline-none ml-2 w-full text-sm placeholder:text-gray-500 text-white"
            />
          </form>

          {/* Auth */}
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="relative w-9 h-9 rounded-full border-2 border-purple-500/50 overflow-hidden flex items-center justify-center bg-purple-500/10 hover:border-purple-400 transition"
                >
                  {avatarUrl
                    ? <Image src={avatarUrl} alt="avatar" width={36} height={36} className="object-cover w-full h-full" />
                    : <span className="text-sm font-bold text-purple-400">{initials}</span>
                  }
                </button>
                {menuOpen && (
                  <div className="absolute right-6 top-20 w-44 rounded-2xl border border-white/10 bg-[#0f0a1e] shadow-xl overflow-hidden z-[60]">
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition">Profile</Link>
                    {user.role === "creator" && (
                      <Link href="/creator/portal" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-purple-400 hover:bg-white/5 transition">Creator Portal</Link>
                    )}
                    <div className="border-t border-white/10" />
                    <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={openDialog}
                  className="px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-sm font-medium"
                >
                  Log In
                </button>
                <button
                  onClick={openDialog}
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 transition text-sm font-medium"
                >
                  Sign Up
                </button>
              </>
            )
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-[#07080f] border-t border-white/10 ${menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 py-4 flex flex-col gap-3">
          <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search manga..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-purple-500/50"
            />
          </form>
          <Link href="/"             onClick={() => setMenuOpen(false)} className="py-2 text-white font-medium">Home</Link>
          <Link href="/browse"       onClick={() => setMenuOpen(false)} className="py-2 text-gray-400 hover:text-white transition">Browse</Link>
          <Link href="/creators"     onClick={() => setMenuOpen(false)} className="py-2 text-gray-400 hover:text-white transition">Creators</Link>
          <Link href="/creator/onboard" onClick={() => setMenuOpen(false)} className="py-2 text-gray-400 hover:text-white transition">Write</Link>
          {!loading && !user && (
            <button onClick={() => { openDialog(); setMenuOpen(false); }} className="mt-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 transition text-sm font-semibold">
              Sign In Free
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
