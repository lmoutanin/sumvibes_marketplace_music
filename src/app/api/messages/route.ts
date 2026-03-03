import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Channel from "@/models/Channel";
import mongoose from "mongoose";

// ─── Helpers ────────────────────────────────────────────────────────────────

function unauthorized(msg = "Non authentifié") {
  return NextResponse.json({ error: msg }, { status: 401 });
}

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

function notFound(msg: string) {
  return NextResponse.json({ error: msg }, { status: 404 });
}

function serverError() {
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

/** Extracts and verifies the Bearer token from the request. */
function authenticate(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  return verifyToken(token); // returns decoded payload or null
}

// ─── GET /api/messages ───────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const decoded = authenticate(req);
    if (!decoded) return unauthorized();

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    // ── Single conversation ────────────────────────────────────────────────
    if (conversationId) {
      const channel = await Channel.findOne({
        $or: [
          { userOneId: decoded.userId, userTwoId: conversationId },
          { userOneId: conversationId, userTwoId: decoded.userId },
        ],
      }).lean();

      if (!channel) return NextResponse.json({ messages: [] });

      const messagesQuery = await Message.find({ channelId: channel._id })
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      if (messagesQuery.length === 0) return NextResponse.json({ messages: [] });

      // Deduplicated user IDs
      const userIds = [
        ...new Set([
          ...messagesQuery.map((m) => m.senderId),
          ...messagesQuery.map((m) => m.recipientId),
        ]),
      ];

      const usersInfo = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          displayName: true,
          username: true,
          avatar: true,
          sellerProfile: { select: { artistName: true } },
        },
      });
      const usersMap = new Map(usersInfo.map((u) => [u.id, u]));

      const messages = messagesQuery.map((m) => ({
        id: m._id.toString(),
        content: m.content,
        senderId: m.senderId,
        recipientId: m.recipientId,
        read: m.read,
        createdAt: m.createdAt,
        sender: usersMap.get(m.senderId) ?? null,
      }));

      // Mark unread messages as read (fire-and-forget is fine here)
      Message.updateMany(
        {
          channelId: channel._id,
          senderId: conversationId,
          recipientId: decoded.userId,
          read: false,
        },
        { $set: { read: true } }
      ).catch((err) => console.error("Error marking messages as read:", err));

      return NextResponse.json({ messages });
    }

    // ── Conversation list ──────────────────────────────────────────────────
    const channels = await Channel.find({
      $or: [{ userOneId: decoded.userId }, { userTwoId: decoded.userId }],
    })
      .populate("lastMessage")
      .lean();

    if (channels.length === 0) return NextResponse.json({ conversations: [] });

    const otherUserIds = channels.map((c: any) =>
      c.userOneId === decoded.userId ? c.userTwoId : c.userOneId
    );

    const otherUsers = await prisma.user.findMany({
      where: { id: { in: otherUserIds } },
      select: { id: true, displayName: true, username: true, avatar: true },
    });
    const usersById = new Map(otherUsers.map((u) => [u.id, u]));

    // Single aggregation to count all unread messages per channel
    const unreadCounts: { _id: mongoose.Types.ObjectId; count: number }[] =
      await Message.aggregate([
        {
          $match: {
            channelId: { $in: channels.map((c: any) => c._id) },
            recipientId: decoded.userId,
            read: false,
          },
        },
        { $group: { _id: "$channelId", count: { $sum: 1 } } },
      ]);
    const unreadMap = new Map(
      unreadCounts.map((r) => [r._id.toString(), r.count])
    );

    const conversations = channels
      .map((c: any) => {
        const otherId =
          c.userOneId === decoded.userId ? c.userTwoId : c.userOneId;
        const otherUser = usersById.get(otherId);
        if (!otherUser) return null;

        return {
          userId: otherId,
          displayName: otherUser.displayName,
          username: otherUser.username,
          avatar: otherUser.avatar,
          lastMessage: (c.lastMessage as any)?.content ?? "",
          lastMessageAt:
            (c.lastMessage as any)?.createdAt ?? c.updatedAt ?? c.createdAt,
          unreadCount: unreadMap.get(c._id.toString()) ?? 0,
        };
      })
      .filter(Boolean)
      .sort(
        (a: any, b: any) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error in GET /api/messages:", error);
    return serverError();
  }
}

// ─── POST /api/messages ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    console.log("[POST /api/messages] Request started.");
    const decoded = authenticate(req);
    if (!decoded) return unauthorized();

    const body = await req.json();
    const { receiverId, content } = body as {
      receiverId?: string;
      content?: string;
    };

    if (!receiverId || !content?.trim())
      return badRequest("Destinataire et contenu requis");

    // Prevent self-messaging
    if (receiverId === decoded.userId)
      return badRequest("Vous ne pouvez pas vous envoyer un message");

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });
    if (!receiver) return notFound("Destinataire introuvable");

    await dbConnect();

    // Find or create channel
    let channel = await Channel.findOne({
      $or: [
        { userOneId: decoded.userId, userTwoId: receiverId },
        { userOneId: receiverId, userTwoId: decoded.userId },
      ],
    });

    if (!channel) {
      try {
        channel = await Channel.create({
          userOneId: decoded.userId,
          userTwoId: receiverId,
        });
      } catch (createErr: any) {
        // Duplicate key: channel was created by a concurrent request — fetch it
        if (createErr.code === 11000) {
          channel = await Channel.findOne({
            $or: [
              { userOneId: decoded.userId, userTwoId: receiverId },
              { userOneId: receiverId, userTwoId: decoded.userId },
            ],
          });
          if (!channel) throw createErr;
        } else {
          throw createErr;
        }
      }
    }

    const message = await Message.create({
      senderId: decoded.userId,
      recipientId: receiverId,
      channelId: channel._id,
      content: content.trim(),
    });

    // Update lastMessage reference
    channel.lastMessage = message._id as mongoose.Types.ObjectId;
    await channel.save();

    const senderInfo = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatar: true,
        sellerProfile: { select: { artistName: true } },
      },
    });

    const responseMsg = {
      id: message._id.toString(),
      content: message.content,
      senderId: message.senderId,
      recipientId: message.recipientId,
      read: message.read,
      createdAt: message.createdAt,
      sender: senderInfo,
    };

    return NextResponse.json(responseMsg, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/messages:", error?.message ?? error, error?.stack);
    return NextResponse.json(
      { error: "Erreur serveur", detail: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}