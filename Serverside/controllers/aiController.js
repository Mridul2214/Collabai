// 

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import AiChat from "../models/aichat.js";
import { trackActivity } from "../utils/analyticstracker.js";

dotenv.config();

// 📌 Start chat or continue with AI
export const chatWithAI = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const userId = req.user._id; // ✅ normalized to _id
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message must be a non-empty string" });
    }

    // Find or create chat history doc
    let chatDoc = await AiChat.findOne({ user: userId });
    if (!chatDoc) {
      chatDoc = new AiChat({ user: userId, messages: [] });
    }

    // Prepare formatted history for Gemini
    const formattedHistory = chatDoc.messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { maxOutputTokens: 300, temperature: 0.9 },
    });

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    let text = response?.text() || "⚠️ No response from AI";

    // Formatting cleanup
    text = text
      .replace(/\*\*/g, "")
      .replace(/^\d+\.\s*/gm, "")
      .replace(/^-\s/gm, "• ")
      .replace(/^\*\s/gm, "• ")
      .replace(/([.!?])\s+/g, "$1\n")
      .replace(/^([A-Z][^•:]+:)/gm, "**$1**")
      .replace(/\n{2,}/g, "\n")
      .trim();

    // Save new messages
    chatDoc.messages.push({ sender: "user", text: message });
    chatDoc.messages.push({ sender: "ai", text });
    await chatDoc.save();

    // 🔥 Track AI chat usage
    await trackActivity(userId, "ai_chat", {
      action: "message",
      messageCount: chatDoc.messages.length,
      prompt: message.substring(0, 100),
    });

    return res.json({
      message: text,
      chatHistory: chatDoc.messages,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "AI service unavailable",
      details: error.message,
    });
  }
};

// 📌 Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Track viewing chat history
    await trackActivity(userId, "site_visit", {
      section: "ai_chat_history",
    });

    const chatDoc = await AiChat.findOne({ user: userId });
    if (!chatDoc) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chatDoc.messages });
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

// 📌 Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatDoc = await AiChat.findOne({ user: userId });

    if (chatDoc) {
      // Track clearing history
      await trackActivity(userId, "ai_chat", {
        action: "clear_history",
        previousMessageCount: chatDoc.messages.length,
      });

      chatDoc.messages = [];
      await chatDoc.save();
    }

    res.json({ messages: [] });
  } catch (err) {
    console.error("Clear history error:", err);
    res.status(500).json({ error: "Failed to clear history" });
  }
};
