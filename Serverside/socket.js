import { Server } from "socket.io";

const rooms = {};

export default function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // Create room
    socket.on("create-room", (roomId, username) => {
      if (!rooms[roomId]) {
        rooms[roomId] = {
          creatorId: socket.id,
          members: [{ socketId: socket.id, username }],
          strokes: [],
        };
      } else {
        // if creator reconnects, update socketId
        rooms[roomId].creatorId = socket.id;
      }

      socket.join(roomId);

      io.to(roomId).emit(
        "update-members",
        rooms[roomId].members.map((u) => u.username)
      );

      // send existing strokes if any
      socket.emit("load-strokes", rooms[roomId].strokes);
    });

    // Request to join
    socket.on("request-join", ({ roomId, username }) => {
      if (!rooms[roomId]) {
        socket.emit("join-rejected", "Room not found");
        return;
      }

      const alreadyMember = rooms[roomId].members.some(u => u.username === username);
      if (alreadyMember) {
        socket.join(roomId);
        io.to(socket.id).emit("join-approved", { roomId });
        socket.emit("load-strokes", rooms[roomId].strokes);
        io.to(roomId).emit(
          "update-members",
          rooms[roomId].members.map((u) => u.username)
        );
        return;
      }

      const creatorId = rooms[roomId].creatorId;
      io.to(creatorId).emit("join-request", {
        requesterId: socket.id,
        username,
        roomId,
      });
    });

    // When a user requests to join a room
    socket.on("join-request", ({ roomId, username }) => {
      console.log(`${username} wants to join room ${roomId}`);

      // If room doesn't exist, create it
      if (!rooms[roomId]) {
        rooms[roomId] = {
          creatorId: socket.id,
          members: [{ socketId: socket.id, username }],
          strokes: [],
        };
        socket.join(roomId);
        console.log(`${username} created room ${roomId}`);
        io.to(socket.id).emit("room-created", { roomId });
        return;
      }

      // Send request to the creator (first user in room)
      if (rooms[roomId].members.length > 0) {
        const creatorSocket = rooms[roomId].creatorId;
        io.to(creatorSocket).emit("join-request-received", {
          requesterId: socket.id,
          username,
          roomId,
        });
      }
    });

    // Creator approves/rejects
    socket.on("respond-join", ({ roomId, requesterId, accept, username }) => {
      if (!rooms[roomId]) return;
      const requesterSocket = io.sockets.sockets.get(requesterId);
      if (!requesterSocket) return;

      if (accept) {
        requesterSocket.join(roomId);
        rooms[roomId].members.push({ socketId: requesterId, username });

        io.to(requesterId).emit("join-approved", { roomId });
        io.to(roomId).emit(
          "update-members",
          rooms[roomId].members.map((u) => u.username)
        );

        // send existing strokes to new member
        requesterSocket.emit("load-strokes", rooms[roomId].strokes);
      } else {
        io.to(requesterId).emit("join-rejected", "Request denied by creator");
      }
    });

    // Creator accepts a join request
    socket.on("accept-request", ({ requesterId, roomId, username }) => {
      const requesterSocket = io.sockets.sockets.get(requesterId);

      if (requesterSocket && rooms[roomId]) {
        requesterSocket.join(roomId);

        // Add the new user to the room
        rooms[roomId].members.push({ socketId: requesterId, username });

        io.to(roomId).emit("user-joined", { username, socketId: requesterId });
        console.log(`${username} joined room ${roomId}`);

        // Update members list
        io.to(roomId).emit(
          "update-members",
          rooms[roomId].members.map((u) => u.username)
        );

        // Send existing strokes to new member
        requesterSocket.emit("load-strokes", rooms[roomId].strokes);
      }
    });

    // Store strokes
    socket.on("draw-stroke", ({ roomId, stroke }) => {
      if (!rooms[roomId]) return;
      rooms[roomId].strokes.push(stroke);
      socket.to(roomId).emit("draw-stroke", { stroke, room: roomId });
    });

    // Whiteboard drawing events
    socket.on("draw", ({ roomId, data }) => {
      if (!rooms[roomId]) return;
      socket.to(roomId).emit("draw", data);
    });

    // Erase events
    socket.on("erase", ({ roomId, data }) => {
      socket.to(roomId).emit("erase", data);
    });

    // Clear board
    socket.on("clear-board", (roomId) => {
      if (rooms[roomId]) rooms[roomId].strokes = [];
      socket.to(roomId).emit("clear-board", roomId);
    });

    // Member leaving
    socket.on("leave-room", ({ roomId, username }) => {
      if (!rooms[roomId]) return;

      // Remove member
      rooms[roomId].members = rooms[roomId].members.filter(u => u.username !== username);

      // Notify creator
      const creatorId = rooms[roomId].creatorId;
      io.to(creatorId).emit("member-left", username);

      // Update remaining members
      io.to(roomId).emit(
        "update-members",
        rooms[roomId].members.map(u => u.username)
      );
    });

    // Join chat room
    socket.on("join chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Handle new message
    // socket.on("new message", (msg) => {
    //   // Broadcast to everyone in the room including sender
    //   io.to(msg.chat).emit("message received", msg);
    // });


    socket.on("send-chat-request", ({ receiverId, senderName }) => {
      const receiverSocket = findUserSocket(receiverId); // You need a mapping: userId -> socketId
      if (receiverSocket) {
        io.to(receiverSocket).emit("chat-request-received", { senderId: socket.userId, senderName });
      }
    });

    socket.on("respond-chat-request", ({ receiverId, accept }) => {
      const senderSocket = findUserSocket(receiverId);
      if (senderSocket) {
        io.to(senderSocket).emit("chat-request-response", { accept });
      }
    });


    // Disconnect
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);

      for (let roomId in rooms) {
        const room = rooms[roomId];
        const index = room.members.findIndex((u) => u.socketId === socket.id);

        if (index !== -1) {
          const leftUser = room.members[index].username;
          room.members.splice(index, 1);

          io.to(roomId).emit(
            "update-members",
            room.members.map((u) => u.username)
          );

          // Notify if creator left
          if (socket.id === room.creatorId && room.members.length > 0) {
            // Assign new creator
            room.creatorId = room.members[0].socketId;
            io.to(room.creatorId).emit("you-are-now-creator");
          }

          // Cleanup empty room
          if (room.members.length === 0) {
            delete rooms[roomId];
          }
        }
      }
    });
  });

  return io;
}