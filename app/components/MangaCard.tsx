import Link from "next/link";
import { IndiaFlag, IconGlobe, IconStar, IconGift } from "./Icons";

type MangaItem = {
  title: string; author: string; genre: string; rating: number; chapters: number
  free: boolean; gradient: string; accent: string; tag?: string
  origin: "Indian" | "International"
};

export default function MangaCard({
  manga,
  readNow = "Read Now",
  href = "/browse",
}: {
  manga: MangaItem;
  readNow?: string;
  href?: string;
}) {
  return (
    <Link href={href} className="group relative flex flex-col card-hover cursor-pointer">
      <div className={`relative rounded-xl overflow-hidden aspect-[2/3] manga-border ${manga.gradient} flex items-end justify-start p-4`}>
        <div className="absolute inset-0 halftone opacity-40 pointer-events-none" />
        <span className="absolute inset-0 flex items-center justify-center font-display text-[7rem] leading-none opacity-10 select-none pointer-events-none text-white">
          {manga.chapters}
        </span>

        <div className="relative z-10 flex flex-col gap-1.5">
          {manga.free && (
            <span className="self-start flex items-center gap-1 px-2.5 py-0.5 rounded bg-jade text-white text-xs font-black uppercase tracking-wider rotate-[-2deg] manga-border">
              <IconGift size={9} />
              FREE
            </span>
          )}
          {manga.tag && (
            <span className="self-start px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/30">
              {manga.tag}
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow">
          {manga.origin === "Indian" ? <IndiaFlag className="scale-90" /> : <IconGlobe size={14} className="text-white" />}
        </div>

        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4 py-2 rounded-full bg-saffron text-white font-bold text-sm manga-border">
            {readNow}
          </span>
        </div>
      </div>

      <div className="mt-3 px-1 flex flex-col gap-1">
        <h3 className="font-bold text-sm text-ink dark:text-cream leading-snug line-clamp-2 group-hover:text-saffron dark:group-hover:text-saffron-bright transition-colors">
          {manga.title}
        </h3>
        <p className="text-xs text-ink/50 dark:text-cream/50">{manga.author}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="px-2 py-0.5 rounded-full bg-saffron/10 dark:bg-saffron/15 text-saffron dark:text-saffron-bright text-[10px] font-semibold">
            {manga.genre}
          </span>
          <div className="flex items-center gap-1">
            <IconStar size={11} filled className="text-gold dark:text-gold-light" />
            <span className="text-xs font-semibold text-ink/70 dark:text-cream/70">{manga.rating}</span>
          </div>
        </div>
        <p className="text-[10px] text-ink/40 dark:text-cream/40">{manga.chapters} ch.</p>
      </div>
    </Link>
  );
}

export type { MangaItem };
