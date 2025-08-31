import Chat from "../models/chat.js";
import User from "../models/user.js";

// Create or fetch private chat after request is accepted
export const accessChat = async (req, res) => {
  const { userId } = req.body; // the other user

  if (!userId) return res.status(400).json({ message: "UserId required" });

  let chat = await Chat.findOne({
    isGroup: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  }).populate("users", "-password");

  if (chat) {
    // Transform the chat to show the other user's name
    const transformedChat = transformChatForUser(chat, req.user._id);
    return res.json(transformedChat);
  }

  const newChat = await Chat.create({
    chatName: "sender",
    isGroup: false,
    users: [req.user._id, userId],
  });

  const fullChat = await Chat.findById(newChat._id).populate("users", "-password");
  
  // Transform the chat to show the other user's name
  const transformedChat = transformChatForUser(fullChat, req.user._id);
  res.status(200).json(transformedChat);
};


// Fetch user chats
// Fetch user chats
export const fetchChats = async (req, res) => {
  const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .sort({ updatedAt: -1 });

  // Transform each chat to show the appropriate display name
  const transformedChats = chats.map(chat => transformChatForUser(chat, req.user._id));
  
  res.json(transformedChats);
};

// Helper function to transform chat for the current user
const transformChatForUser = (chat, currentUserId) => {
  // For group chats, return as is
  if (chat.isGroup) {
    return {
      ...chat.toObject(),
      displayName: chat.chatName
    };
  }
  
  // For one-on-one chats, find the other user
  const otherUser = chat.users.find(user => user._id.toString() !== currentUserId.toString());
  
  // Create a transformed chat object
  return {
    ...chat.toObject(),
    displayName: otherUser ? otherUser.name : 'Unknown User',
    otherUser: otherUser ? { 
      _id: otherUser._id, 
      name: otherUser.name 
    } : null
  };
};
// Create group chat
export const createGroupChat = async (req, res) => {
  const { name, users } = req.body; // users = array of userIds

  if (!users || users.length < 2) {
    return res.status(400).json({ message: "At least 2 users required" });
  }

  const groupChat = await Chat.create({
    chatName: name,
    users: [...users, req.user._id],
    isGroup: true,
    groupAdmin: req.user._id,
  });

  const fullGroup = await Chat.findById(groupChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  // Transform for consistency (though group chats don't need displayName transformation)
  const transformedChat = {
    ...fullGroup.toObject(),
    displayName: name
  };
  
  res.json(transformedChat);
};

// chatController.js
export const addMembersToGroup = async (req, res) => {
  const { chatId, users } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) return res.status(404).json({ message: "Group not found" });

    // Add only users not already in group
    users.forEach(u => {
      if (!chat.users.includes(u)) chat.users.push(u);
    });

    await chat.save();
    const updatedChat = await Chat.findById(chatId).populate("users", "name email");
    res.json(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Leave a group
export const leaveGroup = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.user._id; // From auth middleware

  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) return res.status(404).json({ message: "Group not found" });

    // Remove current user from group
    chat.users = chat.users.filter(u => u.toString() !== userId.toString());
    await chat.save();

    res.json({ message: "You have left the group", chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
