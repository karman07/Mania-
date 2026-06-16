"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import {
  IconSword, IconHeart, IconSparkles, IconSmile,
  IconWand, IconShield, IconCoffee, IconLandmark, IconArrowRight,
} from "./Icons";

const GENRE_META = [
  { Icon: IconSword,    color: "from-red-500 to-orange-600",   iconColor: "text-red-500 dark:text-red-400",      border: "border-red-200 dark:border-red-900/60",      count: "1.2K+", slug: "Action"        },
  { Icon: IconHeart,    color: "from-pink-500 to-rose-600",    iconColor: "text-pink-500 dark:text-pink-400",    border: "border-pink-200 dark:border-pink-900/60",    count: "840+",  slug: "Romance"       },
  { Icon: IconWand,     color: "from-emerald-500 to-teal-700",  iconColor: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/60", count: "970+",  slug: "Fantasy"       },
  { Icon: IconShield,   color: "from-gray-600 to-slate-800",   iconColor: "text-slate-500 dark:text-slate-400",  border: "border-gray-300 dark:border-gray-700/60",    count: "340+",  slug: "Horror"        },
  { Icon: IconSmile,    color: "from-yellow-400 to-lime-500",  iconColor: "text-yellow-500 dark:text-yellow-400",border: "border-yellow-200 dark:border-yellow-900/60",count: "530+",  slug: "Comedy"        },
  { Icon: IconCoffee,   color: "from-amber-400 to-yellow-600", iconColor: "text-amber-600 dark:text-amber-400",  border: "border-amber-200 dark:border-amber-900/60",  count: "460+",  slug: "Slice of Life" },
  { Icon: IconSparkles, color: "from-cyan-500 to-sky-700",     iconColor: "text-cyan-600 dark:text-cyan-400",      border: "border-cyan-200 dark:border-cyan-900/60",    count: "620+",  slug: "Sci-Fi"        },
  { Icon: IconLandmark, color: "from-orange-400 to-amber-600", iconColor: "text-amber-600 dark:text-amber-400",  border: "border-amber-200 dark:border-amber-900/60",  count: "280+",  slug: "Historical"    },
];

export default function GenreGrid() {
  const { t } = useLanguage();

  return (
    <section id="genres" className="py-20 md:py-28 bg-cream dark:bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-saffron/6 dark:bg-saffron/3 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-saffron dark:text-saffron-bright uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-saffron dark:bg-saffron-bright" />
            {t.genres.eyebrow}
            <span className="w-6 h-px bg-saffron dark:bg-saffron-bright" />
          </p>
          <h2 className="font-display text-5xl sm:text-6xl text-ink dark:text-cream tracking-wider mb-4">
            {t.genres.h1}{" "}
            <span className="gradient-text">{t.genres.h2}</span>
          </h2>
          <p className="text-ink/60 dark:text-cream/60 text-base max-w-lg mx-auto">
            {t.genres.sub}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {t.genres.names.map((name, i) => {
            const { Icon, color, iconColor, border, count, slug } = GENRE_META[i];
            return (
              <Link
                key={i}
                href={`/browse?genre=${slug}`}
                className={`group relative rounded-2xl overflow-hidden border-2 ${border} bg-white dark:bg-[#1A1A1A] p-5 flex flex-col gap-3 text-left card-hover`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-8 transition-opacity duration-300 pointer-events-none`} />
                <Icon size={28} className={iconColor} />
                <div>
                  <p className="font-bold text-sm text-ink dark:text-cream group-hover:text-saffron dark:group-hover:text-saffron-bright transition-colors">
                    {name}
                  </p>
                  <p className="text-xs text-ink/40 dark:text-cream/40 font-medium mt-0.5">{count} titles</p>
                </div>
                <IconArrowRight size={14} className="text-saffron/0 group-hover:text-saffron dark:group-hover:text-saffron-bright transition-colors absolute bottom-4 right-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
