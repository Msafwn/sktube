import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import { User } from "../Models/User.model.js";
import { Comment } from "../Models/Comment.model.js";
import { Video } from "../Models/Video.model.js";
import { Notification } from "../Models/Notification.model.js";

let io = null;

// Track active viewers per video/stream: Map<videoId, Set<socketId>>
const streamViewers = new Map();

/**
 * Initialize Socket.IO with HTTP Server & Redis Pub/Sub Adapter
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Attach Redis Pub/Sub Adapter for cluster & multi-server event broadcasting
  try {
    const redisUri = process.env.REDIS_URI || "redis://127.0.0.1:6379";
    const pubClient = new Redis(redisUri, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => Math.min(times * 150, 3000)
    });
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => console.warn("⚠️ [Socket.IO Redis Pub]:", err.message));
    subClient.on("error", (err) => console.warn("⚠️ [Socket.IO Redis Sub]:", err.message));

    io.adapter(createAdapter(pubClient, subClient));
    console.log("⚡ [Socket.IO]: Redis Pub/Sub Adapter attached successfully.");
  } catch (adapterErr) {
    console.warn("⚠️ [Socket.IO]: Redis adapter setup warning (using in-memory fallback):", adapterErr.message);
  }

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
        socket.handshake.headers?.cookie
          ?.split("; ")
          ?.find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
          const user = await User.findById(decoded?._id).select("-password -refreshToken");
          if (user) {
            socket.user = user;
            socket.userId = user._id.toString();
            return next();
          }
        } catch (jwtErr) {
          // Token expired or invalid
        }
      }

      const rawUserId = socket.handshake.auth?.userId;
      if (rawUserId) {
        const user = await User.findById(rawUserId).select("-password -refreshToken").catch(() => null);
        if (user) {
          socket.user = user;
          socket.userId = user._id.toString();
        }
      }

      next();
    } catch (err) {
      socket.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?._id?.toString() || socket.handshake.auth?.userId || socket.userId;

    // 1. If user is logged in, join their dedicated personal notification room
    if (userId) {
      const userRoom = `user_${userId}`;
      socket.join(userRoom);
    }

    // Explicit room registration listener from client
    socket.on("join_user_room", async (registeredId) => {
      if (registeredId) {
        socket.join(`user_${registeredId.toString()}`);
        if (!socket.user) {
          try {
            const foundUser = await User.findById(registeredId).select("-password -refreshToken");
            if (foundUser) {
              socket.user = foundUser;
              socket.userId = foundUser._id.toString();
            }
          } catch (e) {
            // ignore
          }
        }
      }
    });

    // -------------------------------------------------------------
    // 2. LIVE STREAM & VIDEO ROOMS (Chat & Live Viewer Count)
    // -------------------------------------------------------------

    // Join Stream / Video Room
    socket.on("join_stream", async ({ videoId }) => {
      if (!videoId) return;

      const roomName = `stream_${videoId}`;
      await socket.join(roomName);
      socket.currentStreamId = videoId;

      try {
        const sockets = await io.in(roomName).fetchSockets();
        io.to(roomName).emit("stream_viewers_update", {
          videoId,
          viewersCount: sockets.length
        });
      } catch (e) {
        if (!streamViewers.has(videoId)) {
          streamViewers.set(videoId, new Set());
        }
        streamViewers.get(videoId).add(socket.id);
        io.to(roomName).emit("stream_viewers_update", {
          videoId,
          viewersCount: streamViewers.get(videoId).size
        });
      }
    });

    // Leave Stream Room
    socket.on("leave_stream", async ({ videoId }) => {
      if (!videoId) return;

      const roomName = `stream_${videoId}`;
      await socket.leave(roomName);
      socket.currentStreamId = null;

      try {
        const sockets = await io.in(roomName).fetchSockets();
        io.to(roomName).emit("stream_viewers_update", {
          videoId,
          viewersCount: sockets.length
        });
      } catch (e) {
        if (streamViewers.has(videoId)) {
          streamViewers.get(videoId).delete(socket.id);
          io.to(roomName).emit("stream_viewers_update", {
            videoId,
            viewersCount: streamViewers.get(videoId).size
          });
        }
      }
    });

    // Send Live Stream Message
    socket.on("send_stream_message", async ({ videoId, text, badge, senderId }) => {
      if (!videoId || !text?.trim()) return;

      try {
        let currentUser = socket.user;

        // If socket.user not loaded yet, try loading by senderId or socket.userId
        const targetUserId = senderId || socket.userId || socket.handshake.auth?.userId;
        if (!currentUser && targetUserId) {
          try {
            currentUser = await User.findById(targetUserId).select("-password -refreshToken");
            if (currentUser) {
              socket.user = currentUser;
              socket.userId = currentUser._id.toString();
            }
          } catch (fetchErr) {
            console.error("Error fetching user for comment:", fetchErr);
          }
        }

        const senderFullName = currentUser?.fullName || "Viewer";
        const senderUsername = currentUser?.username || "guest";
        const senderAvatar =
          currentUser?.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop";

        let dbCommentId = null;

        // Persist comment to MongoDB database
        try {
          const newComment = await Comment.create({
            content: text.trim(),
            video: videoId,
            owner: currentUser?._id || null
          });
          dbCommentId = newComment._id;

          // Notify video/stream creator
          const streamVideo = await Video.findById(videoId);
          if (streamVideo?.owner && (!currentUser?._id || streamVideo.owner.toString() !== currentUser._id.toString())) {
            try {
              const notif = await Notification.create({
                recipient: streamVideo.owner,
                sender: currentUser?._id || streamVideo.owner,
                type: "comment",
                title: "Live Chat Message",
                message: `${senderFullName} sent a message: "${text.trim().slice(0, 50)}"`,
                video: videoId,
                comment: dbCommentId,
                thumbnail: streamVideo.thumbnail || "",
                link: `/live?v=${videoId}`
              });
              sendRealtimeNotification(streamVideo.owner, notif);
            } catch (nErr) {
              // ignore notification creation error
            }
          }
        } catch (dbErr) {
          console.error("Socket chat comment DB save error:", dbErr);
        }

        const messagePayload = {
          id: dbCommentId ? dbCommentId.toString() : `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          user: senderFullName,
          username: senderUsername,
          avatar: senderAvatar,
          text: text.trim(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          badge: badge || (currentUser?._id ? "Member" : "Guest"),
          createdAt: new Date().toISOString(),
          ownerId: currentUser?._id || null
        };

        // Broadcast to all clients in the stream room
        io.to(`stream_${videoId}`).emit("new_stream_message", messagePayload);
      } catch (err) {
        console.error("Error processing stream message:", err);
      }
    });

    // -------------------------------------------------------------
    // 3. LIVE FLOATING REACTIONS (Hearts, Flames, Claps, 100, Sparkles)
    // -------------------------------------------------------------
    socket.on("send_stream_reaction", ({ videoId, emoji, reactionType }) => {
      if (!videoId) return;

      const reactionPayload = {
        id: `react-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        emoji: emoji || "❤️",
        reactionType: reactionType || "heart",
        xOffset: Math.floor(Math.random() * 70) + 15, // random % position
        timestamp: Date.now()
      };

      // Broadcast reaction to all active viewers in stream room
      io.to(`stream_${videoId}`).emit("new_stream_reaction", reactionPayload);
    });

    // -------------------------------------------------------------
    // 4. WATCH PARTY CO-WATCHING SYNC (Play/Pause/Seek Sync)
    // -------------------------------------------------------------
    socket.on("join_watch_party", ({ partyId, videoId, user }) => {
      if (!partyId) return;

      const partyRoom = `party_${partyId}`;
      socket.join(partyRoom);
      socket.currentPartyId = partyId;

      const roomSize = io.sockets.adapter.rooms.get(partyRoom)?.size || 1;

      io.to(partyRoom).emit("party_status_update", {
        partyId,
        videoId,
        memberCount: roomSize,
        message: `${user?.fullName || "A friend"} joined the Watch Party! 🎉`
      });
    });

    socket.on("leave_watch_party", ({ partyId }) => {
      if (!partyId) return;

      const partyRoom = `party_${partyId}`;
      socket.leave(partyRoom);
      socket.currentPartyId = null;

      const roomSize = io.sockets.adapter.rooms.get(partyRoom)?.size || 0;

      io.to(partyRoom).emit("party_status_update", {
        partyId,
        memberCount: roomSize,
        message: `A member left the party.`
      });
    });

    // Broadcast video playback actions (Play / Pause / Seek)
    socket.on("sync_party_action", ({ partyId, action, currentTime, senderName }) => {
      if (!partyId || !action) return;

      socket.to(`party_${partyId}`).emit("party_action_received", {
        action, // 'PLAY' | 'PAUSE' | 'SEEK'
        currentTime: currentTime || 0,
        senderName: senderName || "Party Member",
        timestamp: Date.now()
      });
    });

    // -------------------------------------------------------------
    // 5. DISCONNECT & CLEANUP
    // -------------------------------------------------------------
    socket.on("disconnect", async () => {
      if (socket.currentStreamId) {
        const videoId = socket.currentStreamId;
        const roomName = `stream_${videoId}`;

        try {
          const sockets = await io.in(roomName).fetchSockets();
          io.to(roomName).emit("stream_viewers_update", {
            videoId,
            viewersCount: sockets.length
          });
        } catch (e) {
          if (streamViewers.has(videoId)) {
            streamViewers.get(videoId).delete(socket.id);
            io.to(roomName).emit("stream_viewers_update", {
              videoId,
              viewersCount: streamViewers.get(videoId).size
            });
          }
        }
      }

      if (socket.currentPartyId) {
        const partyRoom = `party_${socket.currentPartyId}`;
        const roomSize = io.sockets.adapter.rooms.get(partyRoom)?.size || 0;
        io.to(partyRoom).emit("party_status_update", {
          partyId: socket.currentPartyId,
          memberCount: roomSize,
          message: `A member disconnected.`
        });
      }
    });
  });

  return io;
};

/**
 * Get the active Socket.IO Server instance
 */
export const getIO = () => {
  if (!io) {
    console.warn("Socket.io not yet initialized!");
  }
  return io;
};

/**
 * Send real-time notification to a specific user's socket room
 * @param {string|ObjectId} recipientId - The user ID receiving the notification
 * @param {object} notificationData - The full notification payload
 */
export const sendRealtimeNotification = (recipientId, notificationData) => {
  if (!io || !recipientId) return;

  const targetRoom = `user_${recipientId.toString()}`;
  io.to(targetRoom).emit("new_notification", notificationData);
};

/**
 * Broadcast real-time comment to all viewers on the video
 */
export const broadcastNewComment = (videoId, commentData) => {
  if (!io || !videoId || !commentData) return;
  io.to(`stream_${videoId.toString()}`).emit("new_comment", commentData);
};

/**
 * Broadcast deleted comment to all viewers on the video
 */
export const broadcastDeleteComment = (videoId, commentId) => {
  if (!io || !videoId || !commentId) return;
  io.to(`stream_${videoId.toString()}`).emit("delete_comment", { commentId });
};

/**
 * Broadcast updated likes count to all viewers on the video
 */
export const broadcastNewLike = (videoId, likeData) => {
  if (!io || !videoId) return;
  io.to(`stream_${videoId.toString()}`).emit("video_liked", likeData);
};
