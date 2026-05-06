import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiResponseWithSocket = {
  socket: {
    server: NetServer & {
      io?: ServerIO;
    };
  };
} & {
  end: () => void;
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log("[SOCKET SERVER] Initializing Socket.IO server...");
    const io = new ServerIO(res.socket.server as NetServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join-room", (userId: string) => {
        socket.join(userId);
      });

      socket.on("send-message", async (data: unknown) => {
        const msg = data as { recipientId: string; senderId: string };
        // Debug: voir combien de sockets sont dans la room du destinataire
        const recipientRoom = io.sockets.adapter.rooms.get(msg.recipientId);
        const senderRoom = io.sockets.adapter.rooms.get(msg.senderId);
        // Envoyer uniquement au destinataire (pas besoin d'envoyer à l'expéditeur,
        // il a déjà affiché le message en optimistic update)
        io.to(msg.recipientId).emit("new-message", msg);
      });

      socket.on(
        "typing",
        ({
          senderId,
          recipientId,
        }: {
          senderId: string;
          recipientId: string;
        }) => {
          io.to(recipientId).emit("typing", { senderId });
        },
      );

      socket.on(
        "stop-typing",
        ({
          senderId,
          recipientId,
        }: {
          senderId: string;
          recipientId: string;
        }) => {
          io.to(recipientId).emit("stop-typing", { senderId });
        },
      );

      socket.on("disconnect", (reason) => {
      
      });
    });
  } 
  res.end();
};

export default ioHandler;

