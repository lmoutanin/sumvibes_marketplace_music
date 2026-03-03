"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft, ChevronRight, MessageSquare, Flame, Pin, Clock, ThumbsUp,
  Eye, Loader2, AlertCircle, Send, Trash2, Edit2, X, Check,
  Share2, BookmarkPlus,
} from "lucide-react";

const COMMENTS_PER_PAGE = 10;

/* ─── Types ── */
interface Author {
  id: string;
  displayName: string | null;
  username: string;
  avatar: string | null;
  role: string;
  sellerProfile: { artistName: string } | null;
}
interface Comment { id: string; content: string; createdAt: string; author: Author; }
interface Post {
  id: string; title: string; content: string; category: string;
  createdAt: string; author: Author; views: number; likes: number; pinned: boolean;
}

/* ─── Catalog ── */
const CAT: Record<string, { label: string; emoji: string; accent: string }> = {
  PRODUCTION:    { label: "Production",    emoji: "🎹", accent: "#a855f7" },
  MARKETING:     { label: "Marketing",     emoji: "📈", accent: "#3b82f6" },
  EQUIPMENT:     { label: "Équipement",    emoji: "🔌", accent: "#10b981" },
  COLLABORATION: { label: "Collaboration", emoji: "🤝", accent: "#f59e0b" },
  OTHER:         { label: "Général",       emoji: "💬", accent: "#6b7280" },
};

/* ─── Helpers (outside component) ── */
function tAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}
function getName(a: Author) {
  return a.sellerProfile?.artistName || a.displayName || a.username;
}

/* ─── Avatar (outside component, stable reference) ── */
function Avatar({ author, size = 36 }: { author: Author; size?: number }) {
  const name = getName(author);
  const sz = { width: size, height: size };
  if (author.avatar) {
    return <Image src={author.avatar} alt={name} {...sz}
      className="rounded-full object-cover flex-shrink-0 ring-2 ring-white/10" />;
  }
  const letters = name.slice(0, 2).toUpperCase();
  return (
    <div style={{ ...sz, fontSize: Math.round(size * 0.38) }}
      className="rounded-full bg-gradient-to-br from-brand-gold/40 to-purple-600/30 flex items-center justify-center text-brand-gold font-bold flex-shrink-0 ring-2 ring-brand-gold/20">
      {letters}
    </div>
  );
}

/* ══════════════════════════ PAGE ══════════════════════════ */
export default function ForumPostPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const postId = Array.isArray(rawId) ? rawId[0] : rawId as string;
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/forum/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post); setComments(data.comments || []);
        setLikesCount(data.post.likes || 0);
      } else if (res.status === 404) {
        setError("Ce post n'existe pas ou a été supprimé.");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(`Erreur serveur (${res.status}) : ${data.error || "Veuillez réessayer."}`);
      }
    } catch { setError("Erreur réseau."); }
    finally { setLoading(false); }
  }, [postId]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handleLike = async () => {
    if (!user || liking) return;
    const token = localStorage.getItem("token");
    const was = liked;
    const action = was ? "unlike" : "like";
    setLiked(!was); setLiking(true);
    setLikesCount(c => c + (was ? -1 : 1));
    try {
      const res = await fetch(`/api/forum/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) { setLiked(was); setLikesCount(c => c + (was ? 1 : -1)); }
      else {
        const d = await res.json();
        // Sync with server count to avoid drift
        setLikesCount(d.likes ?? (was ? likesCount - 1 : likesCount + 1));
      }
    } catch { setLiked(was); setLikesCount(c => c + (was ? 1 : -1)); }
    finally { setLiking(false); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault(); setCommentError("");
    if (!user) return;
    if (commentInput.trim().length < 3) { setCommentError("Minimum 3 caractères."); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentInput.trim() }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => {
          const updated = [...prev, newComment];
          // Go to last page after posting
          setCurrentPage(Math.ceil(updated.length / COMMENTS_PER_PAGE));
          return updated;
        });
        setCommentInput("");
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else { const d = await res.json(); setCommentError(d.error || "Erreur."); }
    } catch { setCommentError("Erreur réseau."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer ce post ? Cette action est irréversible.")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/forum/posts/${postId}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) router.push("/community/forum");
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/forum/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    if (res.ok) {
      const u = await res.json();
      setPost(p => p ? { ...p, title: u.title, content: u.content } : p);
      setEditing(false);
    }
    setSaving(false);
  };

  const cat = post ? (CAT[post.category] ?? CAT.OTHER) : null;
  const isAuthor = !!(user && post?.author?.id === user.id);

  /* ══ Render ══ */
  return (
    <div className="relative flex-1 flex flex-col bg-gradient-premium">
      <Navbar />

      <main className="flex-1 pt-20 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Link href="/community" className="hover:text-slate-300 transition-colors">Communauté</Link>
            <span>/</span>
            <Link href="/community/forum" className="hover:text-slate-300 transition-colors">Forum</Link>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-[180px]">{post?.title ?? "..."}</span>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center gap-4 py-32">
              <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
              <p className="text-slate-500 text-sm">Chargement du post...</p>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 font-semibold mb-5">{error}</p>
              <Link href="/community/forum" className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold">
                ← Retour au forum
              </Link>
            </div>
          )}

          {/* ══════════ POST ══════════ */}
          {!loading && !error && post && (
            <>
              {/* ── Post Header ── */}
              <div className="mb-2">
                {/* Category + badges */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
                    style={{
                      color: cat?.accent,
                      borderColor: cat?.accent + "55",
                      background: cat?.accent + "18",
                    }}
                  >
                    {cat?.emoji} {cat?.label}
                  </span>
                  {post.pinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
                      <Pin className="w-3 h-3" /> Épinglé
                    </span>
                  )}
                  {comments.length > 20 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                      <Flame className="w-3 h-3" /> Tendance
                    </span>
                  )}
                </div>

                {/* Title */}
                {editing ? (
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    className="w-full text-3xl md:text-4xl font-bold bg-white/5 border border-white/15 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-brand-gold/60 tracking-tight"
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight leading-tight mb-5">
                    {post.title}
                  </h1>
                )}

                {/* Author row */}
                <div className="flex items-center gap-3 pb-5 border-b border-white/8">
                  <Avatar author={post.author} size={42} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white leading-none mb-1">
                      {getName(post.author)}
                      {post.author.role === "ADMIN" && (
                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold align-middle">
                          MOD
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tAgo(post.createdAt)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(post.views || 0).toLocaleString()} vues</span>
                    </div>
                  </div>
                  {isAuthor && !editing && (
                    <div className="flex gap-1 ml-auto">
                      <button onClick={() => { setEditTitle(post.title); setEditContent(post.content); setEditing(true); }}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-all" title="Modifier">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={handleDelete}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Post Body ── */}
              <div className="py-7 border-b border-white/8">
                {editing ? (
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={10}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-gold/60 resize-none text-slate-200 leading-loose text-[15px]"
                  />
                ) : (
                  <div className="text-slate-200 leading-loose whitespace-pre-wrap text-[15px] selection:bg-brand-gold/25">
                    {post.content}
                  </div>
                )}

                {editing && (
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setEditing(false)}
                      className="flex-1 border border-white/15 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-slate-400">
                      <X className="w-4 h-4" /> Annuler
                    </button>
                    <button onClick={handleSaveEdit} disabled={saving || !editTitle.trim() || !editContent.trim()}
                      className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>

              {/* ── Reactions bar ── */}
              {!editing && (
                <div className="flex items-center gap-2 py-4 border-b border-white/8">
                  <button onClick={handleLike} disabled={!user || liking}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                      liked
                        ? "bg-brand-gold text-brand-purple border-brand-gold shadow-md shadow-brand-gold/25"
                        : "border-white/10 hover:border-white/25 hover:bg-white/6"
                    } disabled:opacity-40`}
                    title={user ? (liked ? "Retirer le like" : "Liker") : "Connectez-vous pour liker"}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    onClick={() => document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" })}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-white/10 hover:border-white/25 hover:bg-white/6 transition-all">
                    <MessageSquare className="w-4 h-4" />
                    <span>{comments.length} réponse{comments.length !== 1 ? "s" : ""}</span>
                  </button>

                  <div className="ml-auto flex gap-1">
                    <button className="p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/6 transition-all text-slate-400 hover:text-white" title="Partager">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/6 transition-all text-slate-400 hover:text-white" title="Sauvegarder">
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════ COMMENTS ══════════ */}
              <div className="mt-8">
                {/* Header with total count */}
                <h2 className="text-base font-bold text-slate-300 mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-gold/20 flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-brand-gold" />
                  </span>
                  {comments.length === 0 ? "Aucun commentaire" : `${comments.length} commentaire${comments.length > 1 ? "s" : ""}`}
                </h2>

                {/* Comment list */}
                {comments.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 text-sm border border-dashed border-white/8 rounded-2xl">
                    Soyez le premier à répondre à ce post ✨
                  </div>
                ) : (() => {
                  const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);
                  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
                  const pageComments = comments.slice(
                    (safePage - 1) * COMMENTS_PER_PAGE,
                    safePage * COMMENTS_PER_PAGE
                  );
                  return (
                    <>
                      <div className="space-y-px">
                        {pageComments.map((c, i) => (
                          <div key={c.id} className={`flex gap-4 py-5 ${i < pageComments.length - 1 ? "border-b border-white/5" : ""}`}>
                            {/* Left: avatar + thread line */}
                            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                              <Avatar author={c.author} size={34} />
                              {i < pageComments.length - 1 && (
                                <div className="w-px flex-1 bg-white/5 min-h-[16px] rounded-full mt-1" />
                              )}
                            </div>

                            {/* Right: content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-semibold text-sm text-white">{getName(c.author)}</span>
                                {c.author.role === "ADMIN" && (
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold border border-brand-gold/20">
                                    Mod
                                  </span>
                                )}
                                <span className="text-xs text-slate-600 ml-auto">{tAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={commentsEndRef} />
                      </div>

                      {/* ── Pagination ── */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6 pt-5 border-t border-white/8">
                          {/* Prev */}
                          <button
                            onClick={() => { setCurrentPage(p => Math.max(p - 1, 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            disabled={safePage === 1}
                            className="p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/6 transition-all text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Page précédente"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Page numbers */}
                          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => {
                            const isNear = Math.abs(p - safePage) <= 1 || p === 1 || p === totalPages;
                            const isDot  = !isNear && (p === safePage - 2 || p === safePage + 2);
                            if (!isNear && !isDot) return null;
                            if (isDot) return <span key={p} className="text-slate-600 text-sm px-1">…</span>;
                            return (
                              <button
                                key={p}
                                onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                className={`w-8 h-8 rounded-full text-sm font-semibold transition-all border ${
                                  p === safePage
                                    ? "bg-brand-gold text-brand-purple border-brand-gold shadow-md shadow-brand-gold/25"
                                    : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white hover:bg-white/6"
                                }`}
                              >
                                {p}
                              </button>
                            );
                          })}

                          {/* Next */}
                          <button
                            onClick={() => { setCurrentPage(p => Math.min(p + 1, totalPages)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            disabled={safePage === totalPages}
                            className="p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/6 transition-all text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Page suivante"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* ── Comment form ── */}
                <div id="comment-form" className="mt-8">
                  {user ? (
                    <div className="rounded-2xl border border-white/10 overflow-hidden focus-within:border-brand-gold/40 transition-colors">
                      {/* Form header */}
                      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/8 bg-white/[0.02]">
                        <Avatar
                          author={{
                            id: user.id, displayName: user.displayName || null,
                            username: user.username || "", avatar: user.avatar || null,
                            role: user.role || "", sellerProfile: null,
                          }}
                          size={30}
                        />
                        <span className="text-sm font-semibold text-slate-300">{user.displayName || user.username}</span>
                        <span className="text-xs text-slate-600 ml-1">· Ajouter une réponse</span>
                      </div>

                      <form onSubmit={handleComment}>
                        {commentError && (
                          <div className="flex items-center gap-2 text-red-400 text-xs px-4 pt-3 pb-0">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            {commentError}
                          </div>
                        )}
                        <textarea
                          rows={4}
                          placeholder="Partagez votre avis ou posez une question..."
                          value={commentInput}
                          onChange={e => setCommentInput(e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none resize-none text-sm text-slate-200 placeholder-slate-600"
                        />
                        <div className="flex items-center justify-between px-4 pb-3 pt-1">
                          <span className={`text-xs ${commentInput.length > 0 && commentInput.length < 3 ? "text-red-400" : "text-slate-600"}`}>
                            {commentInput.length > 0 ? `${commentInput.length}/2000` : ""}
                          </span>
                          <button type="submit"
                            disabled={submitting || commentInput.trim().length < 3}
                            className="btn-primary px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Envoyer
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 p-8 text-center">
                      <p className="text-slate-500 text-sm mb-4">Connectez-vous pour rejoindre la discussion</p>
                      <Link href="/auth/login" className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold">
                        Se connecter
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Back button at bottom */}
              <div className="mt-12 pt-8 border-t border-white/8">
                <Link href="/community/forum"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-gold transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Retour au forum
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">© 2026 SUMVIBES by SAS BE GREAT.</div>
      </footer>
    </div>
  );
}