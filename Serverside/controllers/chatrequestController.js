import ChatRequest from "../models/chatrequset.js";
import Chat from "../models/chat.js";

export const fetchRequests = async (req, res) => {
  const requests = await ChatRequest.find({ receiver: req.user._id, status: "pending" })
    .populate("sender", "name email");
  res.json(requests);
};

export const sendRequest = async (req, res) => {
  const { receiverId } = req.body;
  const request = await ChatRequest.create({ sender: req.user._id, receiver: receiverId });
  res.json(request);
};


export const respondRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action = 'accepted' or 'declined'
    const request = await ChatRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = action;
    await request.save();

    let chat = null;

    if (action === "accepted") {
      const senderId = request.sender.toString();
      const receiverId = request.receiver.toString();

      // Check if chat already exists
      const existingChat = await Chat.findOne({
        isGroup: false,
        users: { $all: [senderId, receiverId] },
      });

      if (existingChat) {
        chat = existingChat;
      } else {
        chat = await Chat.create({
          chatName: "sender-chat",
          isGroup: false,
          users: [senderId, receiverId],
        });
      }
    }

    res.json({ request, chat });
  } catch (err) {
    console.error("Error responding to chat request:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};