"use client";

import { useState, useRef, useEffect } from "react";
import type { MangaComment } from "@/app/lib/types";
import { getComments, addComment } from "@/app/lib/api";
import { useAuth } from "@/app/components/AuthProvider";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Avatar({ name, photoURL, size = 8 }: { name: string; photoURL?: string | null; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0 overflow-hidden`;
  if (photoURL) return <img src={photoURL} alt={name} className={`${cls} object-cover`} />;
  return (
    <div className={`${cls} bg-saffron/20 flex items-center justify-center text-saffron font-bold text-xs`}>
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}

interface CommentItemProps {
  comment: MangaComment;
  mangaId: string;
  onReplyPosted: (parent: MangaComment, reply: MangaComment) => void;
  chapterNumber?: number;
}

function CommentItem({ comment, mangaId, onReplyPosted, chapterNumber }: CommentItemProps) {
  const { user, openDialog } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const replies = comment.replies ?? [];

  async function submitReply() {
    if (!user) { openDialog(); return; }
    if (!replyText.trim() || posting) return;
    setPosting(true);
    try {
      const reply = await addComment(mangaId, replyText.trim(), chapterNumber, comment._id);
      onReplyPosted(comment, reply as unknown as MangaComment);
      setReplyText("");
      setShowReply(false);
      setShowReplies(true);
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="flex gap-3">
      <Avatar name={comment.userDisplayName} photoURL={comment.userPhotoURL} size={9} />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-sm text-ink dark:text-cream">{comment.userDisplayName}</span>
          {comment.isCreatorReply && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-saffron/15 border border-saffron/30 text-saffron text-[10px] font-bold uppercase tracking-wider">
              ✍ Creator
            </span>
          )}
          <span className="text-xs text-ink/35 dark:text-cream/35">{timeAgo(comment.createdAt)}</span>
        </div>

        {/* Body */}
        <p className="text-sm text-ink/80 dark:text-cream/80 leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          <button
            id={`reply-btn-${comment._id}`}
            onClick={() => { if (!user) { openDialog(); return; } setShowReply(!showReply); setTimeout(() => textRef.current?.focus(), 50); }}
            className="text-xs font-semibold text-ink/40 dark:text-cream/40 hover:text-saffron transition-colors"
          >
            Reply
          </button>
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs font-semibold text-saffron/70 hover:text-saffron transition-colors"
            >
              {showReplies ? "▲ Hide" : `▼ ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
            </button>
          )}
        </div>

        {/* Reply box */}
        {showReply && (
          <div className="mt-3 flex gap-2">
            <Avatar name={user?.displayName ?? "?"} photoURL={user?.photoURL} size={7} />
            <div className="flex-1">
              <textarea
                ref={textRef}
                id={`reply-input-${comment._id}`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                maxLength={2000}
                className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-white/5 px-3 py-2 text-sm text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 resize-none focus:outline-none focus:border-saffron/50 transition-colors"
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-ink/30 dark:text-cream/30">{replyText.length}/2000</span>
                <div className="flex gap-2">
                  <button onClick={() => setShowReply(false)} className="text-xs text-ink/40 dark:text-cream/40 hover:text-ink transition-colors">Cancel</button>
                  <button
                    onClick={submitReply}
                    disabled={!replyText.trim() || posting}
                    className="px-4 py-1.5 rounded-lg bg-saffron text-white text-xs font-bold disabled:opacity-40 hover:bg-saffron/90 transition-all"
                  >
                    {posting ? "Posting…" : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-4 ml-2 pl-4 border-l-2 border-saffron/20 flex flex-col gap-4">
            {replies.map((r) => (
              <div key={r._id} className="flex gap-2.5">
                <Avatar name={r.userDisplayName} photoURL={r.userPhotoURL} size={7} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs text-ink dark:text-cream">{r.userDisplayName}</span>
                    {r.isCreatorReply && (
                      <span className="px-1.5 py-0.5 rounded-full bg-saffron/15 border border-saffron/30 text-saffron text-[9px] font-bold uppercase tracking-wider">✍ Creator</span>
                    )}
                    <span className="text-[11px] text-ink/30 dark:text-cream/30">{timeAgo(r.createdAt)}</span>
                  </div>
                  <p className="text-sm text-ink/75 dark:text-cream/75 leading-relaxed whitespace-pre-wrap break-words">{r.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentsSectionProps {
  mangaId: string;
  chapterNumber?: number;
  title?: string;
}

export default function CommentsSection({ mangaId, chapterNumber, title = "Comments" }: CommentsSectionProps) {
  const { user, openDialog } = useAuth();
  const [comments, setComments] = useState<MangaComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getComments(mangaId, chapterNumber)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mangaId, chapterNumber]);

  async function submitComment() {
    if (!user) { openDialog(); return; }
    if (!newText.trim() || posting) return;
    setPosting(true);
    try {
      const c = await addComment(mangaId, newText.trim(), chapterNumber);
      setComments((prev) => [{ ...(c as unknown as MangaComment), replies: [] }, ...prev]);
      setNewText("");
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  }

  function handleReplyPosted(parent: MangaComment, reply: MangaComment) {
    setComments((prev) =>
      prev.map((c) =>
        c._id === parent._id
          ? { ...c, replies: [...(c.replies ?? []), reply] }
          : c
      )
    );
  }

  return (
    <section className="mt-12">
      <h2 className="font-display text-3xl text-ink dark:text-cream tracking-wider mb-6">
        {title}{" "}
        {!loading && <span className="text-saffron">({comments.length})</span>}
      </h2>

      {/* New comment box */}
      <div className="mb-8 flex gap-3">
        <Avatar name={user?.displayName ?? "?"} photoURL={user?.photoURL} size={9} />
        <div className="flex-1">
          {user ? (
            <>
              <textarea
                id="new-comment-input"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3}
                maxLength={2000}
                className="w-full rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 resize-none focus:outline-none focus:border-saffron/50 transition-colors"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-ink/30 dark:text-cream/30">{newText.length}/2000</span>
                <button
                  id="post-comment-btn"
                  onClick={submitComment}
                  disabled={!newText.trim() || posting}
                  className="px-6 py-2 rounded-full bg-saffron text-white text-sm font-bold disabled:opacity-40 hover:bg-saffron/90 active:scale-95 transition-all"
                >
                  {posting ? "Posting…" : "Post Comment"}
                </button>
              </div>
            </>
          ) : (
            <button
              id="sign-in-to-comment"
              onClick={openDialog}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-saffron/30 text-saffron/60 hover:border-saffron/60 hover:text-saffron text-sm font-semibold transition-all"
            >
              Sign in to join the conversation →
            </button>
          )}
        </div>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-ink/10 dark:bg-cream/10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-ink/10 dark:bg-cream/10" />
                <div className="h-3 w-full rounded bg-ink/10 dark:bg-cream/10" />
                <div className="h-3 w-3/4 rounded bg-ink/10 dark:bg-cream/10" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border-2 border-dashed border-ink/8 dark:border-cream/8">
          <p className="font-display text-2xl text-ink/20 dark:text-cream/20">No comments yet</p>
          <p className="text-xs text-ink/30 dark:text-cream/30 mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              mangaId={mangaId}
              chapterNumber={chapterNumber}
              onReplyPosted={handleReplyPosted}
            />
          ))}
        </div>
      )}
    </section>
  );
}
