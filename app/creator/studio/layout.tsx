"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import StudioSidebar from "@/app/creator/studio/components/StudioSidebar";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (!loading && user && user.role !== "creator") router.replace("/creator/onboard");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "creator") {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0C0818] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-saffron border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-cream dark:bg-[#0C0818]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <StudioSidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-ink/8 dark:border-cream/8 bg-white dark:bg-[#110B22] sticky top-0 z-30">
          <span className="font-display text-lg gradient-text tracking-widest">RaManga Studio</span>
          <div className="flex items-center gap-2 text-xs font-bold text-saffron uppercase tracking-widest">
            ✦ Creator
          </div>
        </div>
        {/* Mobile nav strip */}
        <div className="md:hidden flex overflow-x-auto border-b border-ink/8 dark:border-cream/8 bg-white dark:bg-[#110B22] sticky top-[49px] z-20 gap-0.5 px-2 py-1.5">
          {[
            { href: "/creator/studio", label: "Home", icon: "▦" },
            { href: "/creator/studio/manga", label: "Manga", icon: "📚" },
            { href: "/creator/studio/create", label: "Create", icon: "✦" },
            { href: "/creator/studio/analytics", label: "Stats", icon: "📈" },
          ].map(({ href, label, icon }) => (
            <a key={href} href={href} className="flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg text-[10px] font-bold text-ink/50 dark:text-cream/50 hover:text-saffron hover:bg-saffron/10 transition-all">
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </a>
          ))}
        </div>

        <div className="p-6 md:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
