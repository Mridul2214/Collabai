import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from "http";
import connectDB from "./config/connection.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import chatrequestRoutes from "./routes/chatrequestRoutes.js"
import initSocket from "./socket.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/todo", todoRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", boardRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chat-request", chatrequestRoutes);

// 1️⃣ Create HTTP server first
const server = http.createServer(app);

// 2️⃣ Initialize Socket.IO with server
const io = initSocket(server);

// 3️⃣ Make io accessible in controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/message", messageRoutes);


// 4️⃣ Start the server
server.listen(3000, () => console.log(`🚀 Server running on port 3000`));
