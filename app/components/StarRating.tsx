"use client";

import { useState } from "react";
import { rateManga, getMyRating } from "@/app/lib/api";
import { useAuth } from "@/app/components/AuthProvider";

interface StarRatingProps {
  mangaId: string;
  initialRating: number;
  ratingCount: number;
  userInitialScore?: number | null;
  onRated?: (newRating: number, count: number) => void;
}

export default function StarRating({
  mangaId,
  initialRating,
  ratingCount,
  userInitialScore = null,
  onRated,
}: StarRatingProps) {
  const { user, openDialog } = useAuth();
  const [avgRating, setAvgRating] = useState(initialRating);
  const [totalCount, setTotalCount] = useState(ratingCount);
  const [userScore, setUserScore] = useState<number | null>(userInitialScore);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justRated, setJustRated] = useState(false);

  const display = hovered ?? userScore ?? Math.round(avgRating);

  async function handleRate(score: number) {
    if (!user) { openDialog(); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await rateManga(mangaId, score);
      setUserScore(score);
      setAvgRating(res.rating);
      setTotalCount(res.ratingCount);
      setJustRated(true);
      onRated?.(res.rating, res.ratingCount);
      setTimeout(() => setJustRated(false), 2000);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Star row */}
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered ?? userScore ?? 0);
          const halfFilled = !filled && star <= (avgRating + 0.5);
          return (
            <button
              key={star}
              id={`star-${star}-${mangaId}`}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className={`text-3xl transition-all duration-150 ${
                submitting ? "opacity-50 cursor-wait" : "cursor-pointer hover:scale-125"
              }`}
              style={{ color: filled ? "#E8521A" : halfFilled ? "#C4922A" : "#1A0A0022" }}
              onMouseEnter={() => !submitting && setHovered(star)}
              onClick={() => handleRate(star)}
            >
              ★
            </button>
          );
        })}
        <span className="ml-2 text-sm font-bold text-ink dark:text-cream">
          {avgRating > 0 ? avgRating.toFixed(1) : "New"}
        </span>
        <span className="text-xs text-ink/40 dark:text-cream/40 ml-1">
          ({totalCount.toLocaleString()} {totalCount === 1 ? "rating" : "ratings"})
        </span>
      </div>

      {/* Feedback line */}
      <div className={`text-xs font-semibold transition-all duration-500 ${justRated ? "opacity-100" : "opacity-0"}`}>
        <span className="text-saffron">✓ Thanks for rating!</span>
      </div>
      {userScore && !justRated && (
        <p className="text-xs text-ink/40 dark:text-cream/40">
          Your rating: {userScore}★ — click to update
        </p>
      )}
      {!user && (
        <button
          onClick={openDialog}
          className="text-xs text-saffron underline underline-offset-2 text-left"
        >
          Sign in to rate
        </button>
      )}
    </div>
  );
}
