import Message from "../models/message.js";
import Chat from "../models/chat.js";
import User from "../models/user.js"; // Make sure to import User

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({ error: "Invalid data passed into request" });
    }

    let newMessage = {
      sender: req.user._id, // req.user should be set by auth middleware
      content: content,
      chat: chatId,
    };

    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    // ✅ Emit message to room
    req.io.to(chatId).emit("message received", message);

    res.json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("chat");
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/message/clear/:chatId
export const clearChatMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    await Message.deleteMany({ chat: chatId });
    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
