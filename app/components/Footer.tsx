"use client";

import { useLanguage } from "./LanguageProvider";
import { IconTwitter, IconInstagram, IconDiscord, IconYoutube, IconHeart } from "./Icons";

const SOCIALS = [
  { label: "X / Twitter", Icon: IconTwitter  },
  { label: "Instagram",   Icon: IconInstagram },
  { label: "Discord",     Icon: IconDiscord   },
  { label: "YouTube",     Icon: IconYoutube   },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-ink dark:bg-[#07040F] text-cream/70 border-t border-white/5">
      <div className="h-1 w-full ink-bg" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12">

          {/* Brand */}
          <div className="md:col-span-1 flex flex-col gap-5">
            <div>
              <span className="font-display text-4xl gradient-text tracking-wider leading-none">RaManga</span>
              <p className="mt-3 text-xs text-cream/50 leading-relaxed">{t.footer.tagline}</p>
            </div>

            <div className="flex gap-3">
              {SOCIALS.map(({ label, Icon }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/15 hover:border-saffron/50 hover:bg-saffron/10 text-cream/50 hover:text-saffron flex items-center justify-center transition-all hover:scale-110"
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-cream/30 uppercase tracking-widest">{t.footer.appSoon}</p>
              <div className="flex gap-2">
                {["App Store", "Google Play"].map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded border border-white/20 text-xs font-medium text-cream/50">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Link columns */}
          {t.footer.cats.map(({ label, links }) => (
            <div key={label} className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-cream/90 uppercase tracking-[0.15em]">{label}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-cream/50 hover:text-saffron dark:hover:text-saffron-bright transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/30">{t.footer.copy}</p>
          <p className="text-xs text-cream/30 flex items-center gap-1.5">
            <IconHeart size={12} filled className="text-red-400" />
            {t.footer.madeWith}
          </p>
        </div>
      </div>
    </footer>
  );
}
