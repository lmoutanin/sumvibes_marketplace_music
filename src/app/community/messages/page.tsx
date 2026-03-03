"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext"; // ← contexte global
import {
  ChevronLeft,
  Search,
  Send,
  Check,
  CheckCheck,
  Loader2,
  User,
  MessageSquare,
  Plus,
  X,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  userId: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  artistName?: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  read: boolean;
  createdAt: string;
  pending?: boolean;
}

interface UserResult {
  id: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  sellerProfile?: { artistName: string } | null;
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-premium flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(d: string): string {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function UserAvatar({
  avatar,
  name,
  size = 44,
}: {
  avatar?: string | null;
  name?: string | null;
  size?: number;
}) {
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-purple/30 to-brand-gold/30 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={name || "user"}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      ) : (
        <User
          className="text-brand-gold"
          style={{ width: size * 0.45, height: size * 0.45 }}
        />
      )}
    </div>
  );
}

// ─── New Conversation Modal ───────────────────────────────────────────────────

function NewConversationModal({
  onClose,
  onSelectUser,
  currentUserId,
}: {
  onClose: () => void;
  onSelectUser: (user: UserResult) => void;
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserResult[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const fetchUsers = async () => {
      try {
        const token = getToken();
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        type RawUser = {
          id: string;
          username: string;
          displayName?: string | null;
          avatar?: string | null;
          sellerProfile?: { artistName: string } | null;
        };

        const rawUsers: RawUser[] = data.users || [];

        setAllUsers(
          rawUsers
            .filter((u) => u.id !== currentUserId)
            .map((u) => ({
              id: u.id,
              username: u.username,
              displayName: u.displayName ?? null,
              avatar: u.avatar ?? null,
              sellerProfile: u.sellerProfile
                ? { artistName: u.sellerProfile.artistName }
                : null,
            })),
        );
      } catch {
        setError("Impossible de charger les utilisateurs.");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [currentUserId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = allUsers.filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const name = u.sellerProfile?.artistName || u.displayName || "";
    return (
      u.username.toLowerCase().includes(q) || name.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,5,40,0.98) 0%, rgba(8,3,22,0.98) 100%)",
          animation: "modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-brand-gold" />
            </div>
            <h2 className="font-bold text-white text-base">
              Nouvelle conversation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un utilisateur…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold/50 transition-all"
            />
          </div>
        </div>

        <div
          className="overflow-y-auto scrollbar-none"
          style={{ maxHeight: "320px", minHeight: "100px" }}
        >
          {loadingUsers ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
            </div>
          ) : error ? (
            <p className="px-5 py-4 text-sm text-red-400 text-center">
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-500">
              <User className="w-8 h-8 opacity-30" />
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filtered.map((u) => {
              const name =
                u.sellerProfile?.artistName || u.displayName || u.username;
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-none group"
                >
                  <UserAvatar avatar={u.avatar} name={name} size={40} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-brand-gold transition-colors">
                      {name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      @{u.username}
                    </p>
                  </div>
                  <span className="text-xs text-brand-gold/60 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    Écrire →
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/5">
          <p className="text-xs text-slate-600 text-center">
            {!loadingUsers &&
              `${filtered.length} utilisateur${filtered.length !== 1 ? "s" : ""} • `}
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-slate-400">
              Echap
            </kbd>{" "}
            pour fermer
          </p>
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function MessagesContent() {
  const { user } = useAuth();

  // ← Plus de socket local — on utilise le socket global du contexte
  // Ce socket reste actif même quand l'user change de page ou d'onglet.
  const {
    socket,
    unreadBySender,
    markAsRead,
    syncUnread,
    setActiveConversationId,
  } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [showNewConv, setShowNewConv] = useState(false);

  // Ref toujours synchrone avec activeConvId pour le handler socket
  const activeConvIdRef = useRef(activeConvId);
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // Informer le contexte global de la conversation active
  useEffect(() => {
    setActiveConversationId(activeConvId);
  }, [activeConvId, setActiveConversationId]);

  useEffect(() => {
    return () => setActiveConversationId("");
  }, [setActiveConversationId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const newUserId = searchParams?.get("new");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // ── Fetch conversations ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("/api/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        let list: Conversation[] = data.conversations || [];

        // Synchroniser les vrais comptes non-lus dans le contexte global
        const unreadMap: Record<string, number> = {};
        for (const conv of list) {
          if (conv.unreadCount > 0) unreadMap[conv.userId] = conv.unreadCount;
        }
        syncUnread(unreadMap);

        if (newUserId) {
          const already = list.some((c) => c.userId === newUserId);
          if (already) {
            setActiveConvId(newUserId);
            setShowMobileList(false);
          } else {
            try {
              const r = await fetch(`/api/users/${newUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (r.ok) {
                const d = await r.json();
                const u = d.user || d;
                list = [
                  {
                    userId: u.id,
                    username: u.username,
                    displayName:
                      u.displayName || u.sellerProfile?.artistName || null,
                    avatar: u.avatar ?? null,
                    lastMessage: "Nouvelle conversation…",
                    lastMessageAt: new Date().toISOString(),
                    unreadCount: 0,
                  },
                  ...list,
                ];
                setActiveConvId(newUserId);
                setShowMobileList(false);
              }
            } catch {
              /* ignore */
            }
          }
        }
        setConversations(list);
      } catch (e) {
        console.error("fetchContacts error", e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchContacts();
    else setLoading(false);
  }, [user, newUserId, syncUnread]);

  // ── Listener "new-message" branché sur le socket.io global ──────────────
  // Le socket du contexte reste actif même hors de cette page.
  // Ici on branche juste la logique propre à la vue chat.
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message: Message) => {
      console.log("[SOCKET] new-message reçu:", message);

      // Ignorer les messages envoyés par soi-même (déjà affichés en optimistic)
      if (message.senderId === user.id) return;

      const currentConvId = activeConvIdRef.current;

      // Ajouter le message dans la fenêtre si la conversation est active
      if (message.senderId === currentConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, { ...message, read: true }];
        });
      }

      // Mettre à jour la liste des conversations
      setConversations((prev) => {
        const exists = prev.some((c) => c.userId === message.senderId);
        const isActive = message.senderId === currentConvId;

        if (exists) {
          // Mettre à jour la conversation existante
          return prev.map((c) => {
            if (c.userId !== message.senderId) return c;
            return {
              ...c,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              unreadCount: isActive ? 0 : c.unreadCount + 1,
            };
          });
        } else {
          // Première fois qu'on reçoit un message de cet expéditeur :
          // ajouter une nouvelle entrée dans la liste puis enrichir avec l'API
          const newConv = {
            userId: message.senderId,
            username: "...",
            displayName: null,
            avatar: null,
            artistName: null,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unreadCount: isActive ? 0 : 1,
          };
          // Enrichir en async sans bloquer
          const token = getToken();
          if (token) {
            fetch(`/api/users/${message.senderId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => r.ok ? r.json() : null)
              .then((d) => {
                if (!d) return;
                const u = d.user || d;
                setConversations((cur) =>
                  cur.map((c) =>
                    c.userId === message.senderId
                      ? {
                        ...c,
                        username: u.username || c.username,
                        displayName: u.displayName ?? null,
                        avatar: u.avatar ?? null,
                        artistName: u.sellerProfile?.artistName ?? null,
                      }
                      : c,
                  ),
                );
              })
              .catch(() => {/* silencieux */ });
          }
          return [newConv, ...prev];
        }
      });
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [socket, user]);

  // Garder les badges locaux en sync avec le contexte global
  useEffect(() => {
    setConversations((prev) =>
      prev.map((c) => ({ ...c, unreadCount: unreadBySender[c.userId] ?? 0 })),
    );
  }, [unreadBySender]);

  // ── Fetch messages initial + polling toutes les 3s (fallback si socket KO) ─
  useEffect(() => {
    if (!activeConvId) return;

    // Marquer lu dans le contexte global → badge navbar à 0 immédiatement
    markAsRead(activeConvId);

    const fetchMessages = async (isInitial = false) => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch(
          `/api/messages?conversationId=${activeConvId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        const fetched: Message[] = (data.messages || []).map((m: Message) =>
          m.senderId !== activeConvId ? m : { ...m, read: true },
        );

        if (isInitial) {
          // Premier chargement : remplacer complètement
          setMessages(fetched);
        } else {
          // Polling : fusionner — ajouter uniquement les nouveaux messages
          setMessages((prev) => {
            const prevIds = new Set(prev.map((m) => m.id));
            // Garder les pending (optimistic) + ajouter les nouveaux
            const pending = prev.filter((m) => m.pending);
            const newOnes = fetched.filter((m) => !prevIds.has(m.id));
            if (newOnes.length === 0) return prev; // rien de nouveau
            // Retirer les pending dont le vrai message est arrivé
            const pendingFiltered = pending.filter(
              (p) => !newOnes.some((n) => n.content === p.content && n.senderId === p.senderId),
            );
            return [...fetched.filter((m) => !pendingFiltered.some((p) => p.id === m.id)), ...pendingFiltered];
          });
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.userId === activeConvId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      } catch (e) {
        console.error("fetchMessages error", e);
      }
    };

    // Chargement initial
    fetchMessages(true);

    // Polling toutes les 3 secondes (fallback si socket ne délivre pas)
    const interval = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(interval);
  }, [activeConvId, markAsRead]);

  // ── Send message — optimiste ─────────────────────────────────────────────
  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim() || !activeConvId || !user || sending) return;

      const content = text.trim();
      setText("");

      // 1. Afficher immédiatement (état pending)
      const tempId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        content,
        senderId: user.id,
        recipientId: activeConvId,
        read: false,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, optimistic]);
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === activeConvId
            ? {
              ...c,
              lastMessage: content,
              lastMessageAt: optimistic.createdAt,
            }
            : c,
        ),
      );

      setSending(true);
      try {
        const token = getToken();
        if (!token) throw new Error("No token");

        const res = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ receiverId: activeConvId, content }),
        });
        if (!res.ok) {
          const textData = await res.text().catch(() => "");
          let errData: any = {};
          try {
            errData = JSON.parse(textData);
          } catch (e) {
            errData = { error: textData || "Invalid server response" };
          }
          console.error("[Send] API error:", res.status, errData);
          throw new Error(errData.detail || errData.error || textData || "Send failed");
        }

        const saved: Message = await res.json();

        // 2. Remplacer l'optimiste par la version serveur
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...saved, pending: false } : m)),
        );

        // 3. Émettre via le socket global (destinataire reçoit en temps réel)
        socket?.emit("send-message", saved);
      } catch (err) {
        console.error("Send error", err);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setText(content);
      } finally {
        setSending(false);
      }
    },
    [text, activeConvId, user, sending, socket],
  );

  // ── Sélectionner un user depuis le modal ─────────────────────────────────
  const handleSelectNewUser = useCallback(
    (selectedUser: UserResult) => {
      setShowNewConv(false);
      const existing = conversations.find((c) => c.userId === selectedUser.id);
      if (existing) {
        setActiveConvId(selectedUser.id);
        setShowMobileList(false);
        return;
      }
      setConversations((prev) => [
        {
          userId: selectedUser.id,
          username: selectedUser.username,
          displayName: selectedUser.displayName ?? null,
          avatar: selectedUser.avatar ?? null,
          artistName: selectedUser.sellerProfile?.artistName ?? null,
          lastMessage: "Nouvelle conversation…",
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        },
        ...prev,
      ]);
      setActiveConvId(selectedUser.id);
      setMessages([]);
      setShowMobileList(false);
    },
    [conversations],
  );

  // ── Derived ──────────────────────────────────────────────────────────────
  const filtered = conversations.filter((c) => {
    const name = c.artistName || c.displayName || c.username || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });
  const activeConv = conversations.find((c) => c.userId === activeConvId);
  const selectConv = (conv: Conversation) => {
    setActiveConvId(conv.userId);
    setShowMobileList(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-gradient-premium">
      <Navbar />

      {showNewConv && user && (
        <NewConversationModal
          onClose={() => setShowNewConv(false)}
          onSelectUser={handleSelectNewUser}
          currentUserId={user.id}
        />
      )}

      <main className="pt-24 pb-20 px-4 md:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-gold mb-8 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-5 h-5" /> Retour au Hub
          </Link>

          <div className="mb-8 relative z-10 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient drop-shadow-lg mb-2">
                Messagerie Privée
              </h1>
              <p className="text-slate-300 font-light">
                Gérez vos collaborations et contrats en direct.
              </p>
            </div>
            <button
              onClick={() => setShowNewConv(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gold text-brand-purple font-semibold text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(254,204,51,0.35)]"
            >
              <Plus className="w-4 h-4" /> Nouvelle conversation
            </button>
          </div>

          <div
            className="glass rounded-3xl overflow-hidden border border-white/10"
            style={{ height: "calc(100vh - 240px)", minHeight: "500px" }}
          >
            <div className="flex h-full">
              {/* ── Sidebar ─────────────────────────────────────────────── */}
              <div
                className={`w-full md:w-80 border-r border-white/10 flex flex-col ${!showMobileList && activeConvId ? "hidden md:flex" : "flex"}`}
              >
                <div className="p-4 border-b border-white/10 flex gap-2">
                  <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-gold transition-colors" />
                    <input
                      type="text"
                      placeholder="Rechercher…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setShowNewConv(true)}
                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold/20 hover:scale-105 transition-all active:scale-95"
                    aria-label="Nouvelle conversation"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-none">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-slate-600 px-6 text-center">
                      <MessageSquare className="w-10 h-10 opacity-25" />
                      <p className="text-sm">Aucune conversation</p>
                      <button
                        onClick={() => setShowNewConv(true)}
                        className="mt-1 text-xs text-brand-gold/70 hover:text-brand-gold transition-colors underline underline-offset-2"
                      >
                        Démarrer une conversation
                      </button>
                    </div>
                  ) : (
                    filtered.map((conv) => {
                      const name =
                        conv.artistName || conv.displayName || conv.username;
                      const active = activeConv?.userId === conv.userId;
                      return (
                        <button
                          key={conv.userId}
                          onClick={() => selectConv(conv)}
                          className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 text-left border-b border-white/5 transition-colors ${active ? "bg-brand-gold/5 border-l-2 border-brand-gold" : ""}`}
                        >
                          <UserAvatar
                            avatar={conv.avatar}
                            name={name}
                            size={44}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm truncate">
                                {name}
                              </span>
                              <span className="text-xs text-slate-400 flex-shrink-0 ml-1">
                                {timeAgo(conv.lastMessageAt)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              {conv.lastMessage}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-brand-gold text-brand-purple text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ── Chat Window ─────────────────────────────────────────── */}
              <div
                className={`flex-1 flex flex-col ${showMobileList && !activeConvId ? "hidden md:flex" : "flex"}`}
              >
                {activeConv ? (
                  <>
                    <div className="p-4 border-b border-white/10 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setShowMobileList(true);
                          setActiveConvId("");
                        }}
                        className="md:hidden p-2 rounded-xl glass mr-1"
                        aria-label="Retour"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <UserAvatar
                        avatar={activeConv.avatar}
                        name={
                          activeConv.artistName ||
                          activeConv.displayName ||
                          activeConv.username
                        }
                        size={40}
                      />
                      <div>
                        <div className="font-bold">
                          {activeConv.artistName ||
                            activeConv.displayName ||
                            activeConv.username}
                        </div>
                        <p className="text-xs text-slate-400">
                          @{activeConv.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600 text-center">
                          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                            <Send className="w-5 h-5 opacity-40" />
                          </div>
                          <p className="text-sm">
                            Commencez la conversation avec{" "}
                            <span className="text-slate-400 font-medium">
                              {activeConv.artistName ||
                                activeConv.displayName ||
                                activeConv.username}
                            </span>
                          </p>
                        </div>
                      )}
                      {messages.map((msg) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-300`}
                          >
                            <div
                              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm transition-opacity duration-200 ${isMine
                                  ? "bg-brand-gold text-brand-purple font-medium rounded-br-sm shadow-[0_4px_15px_rgba(254,204,51,0.2)]"
                                  : "glass rounded-bl-sm"
                                } ${msg.pending ? "opacity-55" : "opacity-100"}`}
                            >
                              <p className="break-words">{msg.content}</p>
                              <div
                                className={`flex items-center gap-1 mt-1 text-[10px] ${isMine ? "text-brand-purple/60 justify-end" : "text-slate-500"}`}
                              >
                                {msg.pending ? (
                                  <span className="italic opacity-70">
                                    envoi…
                                  </span>
                                ) : (
                                  <>
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      "fr-FR",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                    {isMine &&
                                      (msg.read ? (
                                        <CheckCheck className="w-3 h-3" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      ))}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <form
                      onSubmit={handleSend}
                      className="p-4 border-t border-white/10 flex items-center gap-3 bg-white/5 backdrop-blur-sm"
                    >
                      <input
                        type="text"
                        placeholder="Votre message…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e as React.FormEvent);
                          }
                        }}
                        maxLength={2000}
                        className="flex-1 px-4 py-3 bg-[#0a0520]/50 border border-white/10 rounded-xl focus:outline-none focus:border-brand-gold/50 focus:shadow-[0_0_15px_rgba(254,204,51,0.15)] text-sm transition-all text-white"
                      />
                      <button
                        type="submit"
                        disabled={!text.trim()}
                        className="p-3 bg-brand-gold rounded-xl text-black disabled:opacity-50 hover:scale-105 transition-transform disabled:hover:scale-100 shadow-[0_0_15px_rgba(254,204,51,0.4)]"
                        aria-label="Envoyer"
                      >
                        <Send className="w-5 h-5 -translate-x-[1px] translate-y-[1px]" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/10">
                    <div className="w-20 h-20 rounded-full border border-white/5 bg-white/5 shadow-inner flex items-center justify-center mb-6">
                      <MessageSquare className="w-8 h-8 stroke-[1] text-brand-gold" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-white mb-2">
                      Sélectionnez un contact
                    </h3>
                    <p className="font-light text-slate-400 max-w-xs mb-5">
                      Choisissez une conversation ou démarrez-en une nouvelle.
                    </p>
                    <button
                      onClick={() => setShowNewConv(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-medium text-sm hover:bg-brand-gold/20 hover:scale-105 transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Nouvelle conversation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
