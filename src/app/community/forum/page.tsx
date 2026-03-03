"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft, ChevronRight, Search, MessageSquare, Flame, Pin,
  Clock, ThumbsUp, Eye, Plus, Loader2, AlertCircle, X,
} from "lucide-react";

const POSTS_PER_PAGE = 10;

const CATEGORIES = [
  { id: "all",           label: "Tout",          emoji: "🗂️" },
  { id: "PRODUCTION",    label: "Production",     emoji: "🎹" },
  { id: "MARKETING",     label: "Marketing",      emoji: "📈" },
  { id: "EQUIPMENT",     label: "Équipement",     emoji: "🔌" },
  { id: "COLLABORATION", label: "Collaboration",  emoji: "🤝" },
  { id: "OTHER",         label: "Général",        emoji: "💬" },
];

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string | null;
    username: string;
    avatar: string | null;
    sellerProfile: { artistName: string } | null;
  };
  _count: { comments: number };
  views: number;
  likes: number;
  pinned: boolean;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}j`;
}
function authorName(p: Post) {
  return p.author.sellerProfile?.artistName || p.author.displayName || p.author.username;
}

function PostRow({ post, onLike, likingId, isLoggedIn }: {
  post: Post;
  onLike: (id: string) => void;
  likingId: string | null;
  isLoggedIn: boolean;
}) {
  const name = authorName(post);
  const initials = name.slice(0, 2).toUpperCase();
  const cat = CATEGORIES.find((c) => c.id === post.category);

  return (
    <div className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {post.author.avatar ? (
            <Image src={post.author.avatar} alt={name} width={40} height={40}
              className="rounded-full object-cover ring-2 ring-white/10" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-sm ring-2 ring-brand-gold/10">
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {post.pinned && <Pin className="w-4 h-4 text-brand-gold flex-shrink-0" />}
            {post._count.comments > 20 && <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />}
            <Link href={`/community/forum/${post.id}`}
              className="font-bold hover:text-brand-gold transition-colors group-hover:text-brand-gold/90 truncate">
              {post.title}
            </Link>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="font-medium text-slate-300">{name}</span>
            {cat && <span className="glass px-2 py-0.5 rounded">{cat.emoji} {cat.label}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(post.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MessageSquare className="w-3.5 h-3.5" />{post._count.comments}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />{(post.views || 0).toLocaleString()}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); onLike(post.id); }}
            disabled={!isLoggedIn || likingId === post.id}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isLoggedIn ? "hover:text-brand-gold cursor-pointer" : "cursor-default"
            } ${likingId === post.id ? "text-brand-gold" : "text-slate-400"}`}
            title={isLoggedIn ? "Liker ce post" : "Connectez-vous pour liker"}
          >
            <ThumbsUp className="w-3.5 h-3.5" />{post.likes || 0}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "PRODUCTION" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [likingId, setLikingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowModal(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const p = new URLSearchParams({ limit: "50" });
      if (activeCategory !== "all") p.set("category", activeCategory);
      if (debouncedSearch) p.set("search", debouncedSearch);
      const res = await fetch(`/api/forum/posts?${p}`);
      if (res.ok) {
        const d = await res.json();
        setPosts(d.posts || []);
      } else {
        setFetchError("Impossible de charger les posts.");
      }
    } catch {
      setFetchError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, debouncedSearch]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setCurrentPage(1); }, [activeCategory, debouncedSearch]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!user) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        setShowModal(false);
        setNewPost({ title: "", content: "", category: "PRODUCTION" });
        fetchPosts();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Erreur lors de la création du post.");
      }
    } catch { setErrorMsg("Erreur réseau."); }
    finally { setSubmitting(false); }
  };

  const handleLike = async (postId: string) => {
    if (!user || likingId) return;
    setLikingId(postId);
    const token = localStorage.getItem("token");
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    try {
      const res = await fetch(`/api/forum/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
      if (!res.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
      }
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
    } finally { setLikingId(null); }
  };

  const pinned    = posts.filter(p => p.pinned);
  const regular   = posts.filter(p => !p.pinned);
  const totalPages = Math.ceil(regular.length / POSTS_PER_PAGE);
  const safePage   = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const pagePosts  = regular.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  return (
    <div className="relative flex-1 flex flex-col bg-gradient-premium">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Link href="/community" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-6 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Retour à la communauté
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient">Forum</h1>
              <p className="text-slate-400 mt-2">Échangez, apprenez et partagez avec la communauté SUMVIBES</p>
            </div>
            {user && (
              <button onClick={() => setShowModal(true)}
                className="btn-primary px-6 py-3 rounded-full font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5" /> Nouveau post
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap mb-6">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === c.id ? "bg-brand-gold text-brand-purple" : "glass hover:bg-white/10"
                }`}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Rechercher un sujet..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold/50 placeholder-slate-500 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto" />
              <p className="text-slate-400 mt-3">Chargement des posts...</p>
            </div>
          ) : fetchError ? (
            <div className="glass rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-semibold">{fetchError}</p>
              <button onClick={fetchPosts} className="btn-primary px-6 py-2 rounded-full mt-4 text-sm">
                Réessayer
              </button>
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-widest mb-3 flex items-center gap-2">
                    <Pin className="w-3 h-3" /> Épinglés
                  </p>
                  <div className="space-y-3">
                    {pinned.map(p => (
                      <PostRow key={p.id} post={p} onLike={handleLike} likingId={likingId} isLoggedIn={!!user} />
                    ))}
                  </div>
                </div>
              )}

              {regular.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {pagePosts.map(p => (
                      <PostRow key={p.id} post={p} onLike={handleLike} likingId={likingId} isLoggedIn={!!user} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pt-5 border-t border-white/8">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={safePage === 1}
                        className="p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/6 transition-all text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Page précédente"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        const isNear = Math.abs(page - safePage) <= 1 || page === 1 || page === totalPages;
                        const isDot  = !isNear && (page === safePage - 2 || page === safePage + 2);
                        if (!isNear && !isDot) return null;
                        if (isDot) return <span key={page} className="text-slate-600 text-sm px-1">…</span>;
                        return (
                          <button key={page} onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-full text-sm font-semibold transition-all border ${
                              page === safePage
                                ? "bg-brand-gold text-brand-purple border-brand-gold shadow-md shadow-brand-gold/25"
                                : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white hover:bg-white/6"
                            }`}>
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={safePage === totalPages}
                        className="p-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/6 transition-all text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Page suivante"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="glass rounded-2xl p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-1">Aucun post pour l&apos;instant.</p>
                  {debouncedSearch && (
                    <p className="text-slate-500 text-sm">Aucun résultat pour &quot;{debouncedSearch}&quot;</p>
                  )}
                  {user && !debouncedSearch && (
                    <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-3 rounded-full mt-4">
                      Créer le premier post
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ══════════ MODAL CRÉATION POST ══════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div ref={modalRef}
            className="glass rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nouveau post</h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Titre */}
              <div>
                <input type="text" required maxLength={200}
                  placeholder="Titre du post * (min. 5 caractères)"
                  value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold transition-colors"
                />
                <div className="flex justify-between mt-1 px-1">
                  <span className={`text-xs ${newPost.title.length > 0 && newPost.title.length < 5 ? "text-red-400" : "text-slate-500"}`}>
                    {newPost.title.length > 0 && newPost.title.length < 5 ? "Min. 5 caractères" : ""}
                  </span>
                  <span className="text-xs text-slate-500">{newPost.title.length}/200</span>
                </div>
              </div>

              {/* Catégorie */}
              <select value={newPost.category}
                onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold transition-colors">
                {CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-800">{c.emoji} {c.label}</option>
                ))}
              </select>

              {/* Contenu */}
              <div>
                <textarea required rows={5} maxLength={10000}
                  placeholder="Contenu du post * (min. 20 caractères)"
                  value={newPost.content}
                  onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold transition-colors resize-none"
                />
                <div className="flex justify-between mt-1 px-1">
                  <span className={`text-xs ${newPost.content.length > 0 && newPost.content.length < 20 ? "text-red-400" : "text-slate-500"}`}>
                    {newPost.content.length > 0 && newPost.content.length < 20 ? "Min. 20 caractères" : ""}
                  </span>
                  <span className="text-xs text-slate-500">{newPost.content.length}/10 000</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 glass py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Annuler
                </button>
                <button type="submit"
                  disabled={submitting || newPost.title.length < 5 || newPost.content.length < 20}
                  className="flex-1 btn-primary py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Publication..." : "Publier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-slate-500 text-sm">© 2026 SUMVIBES by SAS BE GREAT.</div>
      </footer>
    </div>
  );
}