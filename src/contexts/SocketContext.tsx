"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IncomingMessage {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  read: boolean;
  createdAt: string;
}

interface SocketContextValue {
  socket: Socket | null;
  totalUnread: number;
  unreadBySender: Record<string, number>;
  markAsRead: (senderId: string) => void;
  syncUnread: (map: Record<string, number>) => void;
  setActiveConversationId: (conversationUserId: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  totalUnread: 0,
  unreadBySender: {},
  markAsRead: () => {},
  syncUnread: () => {},
  setActiveConversationId: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return (
      <SocketContext.Provider
        value={{
          socket: null,
          totalUnread: 0,
          unreadBySender: {},
          markAsRead: () => {},
          syncUnread: () => {},
          setActiveConversationId: () => {},
        }}
      >
        {children}
      </SocketContext.Provider>
    );
  }

  return (
    <AuthedSocketProvider key={user.id} userId={user.id}>
      {children}
    </AuthedSocketProvider>
  );
}

function AuthedSocketProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [unreadBySender, setUnreadBySender] = useState<Record<string, number>>(
    {},
  );
  const totalUnread = Object.values(unreadBySender).reduce((a, b) => a + b, 0);

  const [activeConversationId, setActiveConversationIdState] =
    useState<string>("");
  const activeConversationIdRef = useRef<string>("");
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const [socket] = useState<Socket>(() =>
    io(undefined as string | undefined, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    }),
  );

  useEffect(() => {
    // Important avec Next.js : appeler la route API une première fois pour
    // initialiser le serveur Socket.IO côté Node, puis seulement ensuite
    // connecter le client.
    fetch("/api/socket/io")
      .catch(() => {})
      .finally(() => socket.connect());

    const joinRoom = () => {
      socket.emit("join-room", userId);
    };

    socket.on("connect", joinRoom);
    socket.on("reconnect", joinRoom);

    // IMPORTANT : stocker la référence du handler pour ne retirer QUE celui-ci
    // lors du cleanup (socket.off sans référence retire TOUS les listeners).
    const handleNewMsg = (message: IncomingMessage) => {
      console.log("[SOCKET CONTEXT] new-message reçu:", message);
      // Si l'utilisateur est en train de lire cette conversation, ne pas incrémenter
      if (activeConversationIdRef.current === message.senderId) return;
      // Ne pas incrémenter pour les messages qu'on a soi-même envoyés
      if (message.senderId === userId) return;
      setUnreadBySender((prev) => ({
        ...prev,
        [message.senderId]: (prev[message.senderId] ?? 0) + 1,
      }));
    };
    socket.on("new-message", handleNewMsg);

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (socket.connected) {
        socket.emit("join-room", userId);
      } else {
        socket.connect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Chargement initial des non-lus depuis l'API
    const fetchInitialUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const initial: Record<string, number> = {};
        for (const conv of data.conversations || []) {
          if (conv.unreadCount > 0) initial[conv.userId] = conv.unreadCount;
        }
        setUnreadBySender(initial);
      } catch {
        /* silencieux */
      }
    };
    fetchInitialUnread();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket.off("connect", joinRoom);
      socket.off("reconnect", joinRoom);
      // Retirer UNIQUEMENT ce handler, pas tous les listeners "new-message"
      socket.off("new-message", handleNewMsg);
      socket.disconnect();
    };
  }, [socket, userId]);

  const markAsRead = useCallback((senderId: string) => {
    setUnreadBySender((prev) => {
      if (!prev[senderId]) return prev;
      const next = { ...prev };
      delete next[senderId];
      return next;
    });
  }, []);

  const syncUnread = useCallback((incoming: Record<string, number>) => {
    setUnreadBySender(incoming);
  }, []);

  const setActiveConversationId = useCallback((conversationUserId: string) => {
    setActiveConversationIdState(conversationUserId);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        totalUnread,
        unreadBySender,
        markAsRead,
        syncUnread,
        setActiveConversationId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
