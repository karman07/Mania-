"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import Image from "next/image";

const NAV = [
  { href: "/creator/studio", label: "Dashboard", icon: "▦", exact: true },
  { href: "/creator/studio/manga", label: "My Manga", icon: "📚", exact: false },
  { href: "/creator/studio/create", label: "Create New", icon: "✦", exact: false },
  { href: "/creator/studio/analytics", label: "Analytics", icon: "📈", exact: false },
];

export default function StudioSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside
      className={`flex flex-col h-full transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      } bg-white dark:bg-[#110B22] border-r border-ink/8 dark:border-cream/8`}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-ink/8 dark:border-cream/8">
        {!collapsed && (
          <Link href="/" className="font-display text-xl tracking-widest gradient-text">
            RaManga
          </Link>
        )}
        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-saffron/10 hover:bg-saffron/20 text-saffron transition-all ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Creator Avatar */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-ink/8 dark:border-cream/8 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-saffron/30">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt={user.displayName} width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full bg-saffron/20 flex items-center justify-center font-bold text-saffron">
              {user?.displayName?.charAt(0) ?? "?"}
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-sm text-ink dark:text-cream truncate">{user?.displayName}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-saffron uppercase tracking-widest">
              ✦ Creator
            </span>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all group ${
                active
                  ? "bg-saffron text-white shadow-lg shadow-saffron/25"
                  : "text-ink/60 dark:text-cream/60 hover:bg-saffron/10 hover:text-saffron"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className="text-base flex-shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className={`px-2 pb-4 border-t border-ink/8 dark:border-cream/8 pt-3 ${collapsed ? "flex justify-center" : ""}`}>
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink/40 dark:text-cream/40 hover:text-saffron hover:bg-saffron/10 transition-all ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Back to site" : undefined}
        >
          <span>←</span>
          {!collapsed && <span>Back to site</span>}
        </Link>
      </div>
    </aside>
  );
}
