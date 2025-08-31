import { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "../css/Chatpage.css";

let socket;

export default function ChatPage() {
  // State declarations
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);

  // Refs and constants
  const messagesEndRef = useRef(null);
  const API_BASE = "http://localhost:3000/api";
  const loggedInUserId = localStorage.getItem("userId");

  // Helper functions
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Group creation function
  const createGroup = async () => {
    if (selectedChat?.isGroup) {
      if (!selectedUsers.length) {
        alert("Select at least 1 user to add");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        await axios.post(`${API_BASE}/chat/group/add`,
          { chatId: selectedChat._id, users: selectedUsers },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Refresh selectedChat users
        const { data } = await axios.get(`${API_BASE}/chat/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSelectedChat(data);
        setShowGroupModal(false);
        setSelectedUsers([]);
      } catch (err) {
        console.error(err);
        alert("Error adding members");
      }
    } else {
      // Creating new group
      if (!groupName || selectedUsers.length < 1) {
        alert("Group name and at least 1 member required");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(`${API_BASE}/chat/group`,
          { name: groupName, users: selectedUsers },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChats(prev => [data, ...prev]);
        setSelectedChat(data);
        setShowGroupModal(false);
        setGroupName("");
        setSelectedUsers([]);
      } catch (err) {
        console.error(err);
        alert("Error creating group");
      }
    }
  };

  // Auto-scroll messages function
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Effects
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Initialize socket effect
  useEffect(() => {
    socket = io("http://localhost:3000");

    socket.on("message received", (newMessage) => {
      if (selectedChat && newMessage.chat === selectedChat._id) {
        setMessages((prev) => prev.some(msg => msg._id === newMessage._id) ? prev : [...prev, newMessage]);
      }
    });

    fetchChats();
    fetchPendingRequests();

    return () => socket.disconnect();
  }, []);

  // Update socket listener when selectedChat changes
  useEffect(() => {
    if (!socket) return;
    socket.off("message received");

    socket.on("message received", (newMessage) => {
      const chatId = typeof newMessage.chat === "string" ? newMessage.chat : newMessage.chat._id;
      if (selectedChat && chatId === selectedChat._id) {
        setMessages(prev => prev.some(m => m._id === newMessage._id) ? prev : [...prev, newMessage]);
      }
    });
  }, [selectedChat]);

  // API functions
  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/chat-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!search) return setSearchResults([]);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/user/search`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = data.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    }
  };

  const requestChat = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/chat-request/send`, { receiverId: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Chat request sent!");
      setSearch("");
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    }
  };

  const respondRequest = async (requestId, accept) => {
    try {
      const token = localStorage.getItem("token");
      const action = accept ? "accepted" : "declined";
      const { data } = await axios.post(`${API_BASE}/chat-request/respond`, { requestId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (accept && data.chat) {
        setChats(prev => [data.chat, ...prev]);
      }

      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/message/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage || !selectedChat || isSending) return;

    setIsSending(true);
    const tempMessageId = `temp-${Date.now()}`;

    const tempMessage = {
      _id: tempMessageId,
      sender: { _id: loggedInUserId, name: "You" },
      content: newMessage,
      chat: selectedChat._id,
      createdAt: new Date().toISOString(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${API_BASE}/message`, { content: newMessage, chatId: selectedChat._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => prev.map(m => m._id === tempMessageId ? data : m));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m._id !== tempMessageId));
    } finally {
      setIsSending(false);
    }
  };

  const startChat = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`${API_BASE}/chat`, { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(prev => [data, ...prev]);
      setSearch("");
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    }
  };

  // UI helper functions
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "U";

  const getChatDisplayName = (chat) => {
    return chat.displayName || "Unknown User";
  };

  const openGroupModal = () => {
    const users = Array.from(
      new Map(
        chats
          .filter(chat => !chat.isGroup)
          .map(chat => {
            const otherUser = chat.users.find(u => u._id !== loggedInUserId);
            return [otherUser._id, otherUser];
          })
      ).values()
    );

    setGroupUsers(users);
    setSelectedUsers([]);
    setGroupName("");
    setShowGroupModal(true);
  };

  const getGroupMemberNames = (chat) => {
    if (!chat.isGroup || !chat.users) return "";
    return chat.users
      .filter(u => u._id !== loggedInUserId)
      .map(u => u.name)
      .join(", ");
  };

  const openAddMembersModal = () => {
    if (!selectedChat || !selectedChat.isGroup) return;
    const usersToAdd = Array.from(
      new Map(
        chats
          .filter(chat => !chat.isGroup)
          .flatMap(chat => chat.users)
          .filter(u => u._id !== loggedInUserId && !selectedChat.users.some(su => su._id === u._id))
          .map(u => [u._id, u])
      ).values()
    );
    setGroupUsers(usersToAdd);
    setSelectedUsers([]);
    setShowGroupModal(true);
  };

  const leaveGroupChat = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/chat/group/leave`, { chatId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats(prev => prev.filter(c => c._id !== chatId));
      setSelectedChat(null);
      alert("You have left the group");
    } catch (err) {
      console.error(err);
      alert("Error leaving the group");
    }
  };

  // JSX Return
  return (
    <div className="chatpage-wrapper">
      <div className="chatpage-container">
        {/* Sidebar */}
        <div className="chatpage-sidebar">
          <div className="chatpage-sidebar-header">
            <div className="chatpage-user-avatar"></div>
            <h3>💬Chat</h3>
          </div>

          <div className="chatpage-search-container">
            <div className="chatpage-search-box">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="chatpage-search-input"
              />
              <button onClick={handleSearch} className="chatpage-search-button">🔍</button>
            </div>
            <button onClick={openGroupModal} className="chatpage-create-group">
              + Create Group
            </button>
            {showGroupModal && (
              <div className="chatpage-modal">
                <div className="chatpage-modal-content">
                  <h3>Create Group</h3>
                  <input
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                  <div className="chatpage-user-selection">
                    {groupUsers.map(u => (
                      <div key={u._id}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u._id)}
                          onChange={() => toggleUserSelection(u._id)}
                        />
                        {u.name}
                      </div>
                    ))}
                  </div>
                  <button onClick={createGroup}>Create</button>
                  <button onClick={() => setShowGroupModal(false)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Pending requests */}
            {pendingRequests.map(r => (
              <div key={r._id} className="chatpage-request-item">
                <span>{r.sender.name} wants to chat</span>
                <button onClick={() => respondRequest(r._id, true)}>Accept</button>
                <button onClick={() => respondRequest(r._id, false)}>Decline</button>
              </div>
            ))}

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="chatpage-search-results">
                {searchResults.map((u) => (
                  <div key={u._id} className="chatpage-search-result-item">
                    {u.name}
                    <button onClick={() => requestChat(u._id)}>Send Request</button>
                    {/* <button onClick={() => startChat(u._id)}></button> */}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chats list */}
          <div className="chatpage-chats-list">
            {chats.map(chat => (
              <div
                key={chat._id}
                className={`chatpage-chat-item ${selectedChat?._id === chat._id ? "active" : ""}`}
                onClick={() => {
                  setSelectedChat(chat);
                  fetchMessages(chat._id);
                  socket.emit("join chat", chat._id);
                }}
              >
                <div className="chatpage-chat-avatar">
                  {getInitial(getChatDisplayName(chat))}
                </div>
                <div className="chatpage-chat-info">
                  <div className="chatpage-chat-name">
                    {getChatDisplayName(chat)}
                  </div>
                  <div className="chatpage-chat-preview">
                    {chat.latestMessage ? chat.latestMessage.content : ""}
                  </div>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!window.confirm("Clear all messages for this chat?")) return;
                    try {
                      const token = localStorage.getItem("token");
                      await axios.delete(`${API_BASE}/message/clear/${chat._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (selectedChat?._id === chat._id) setMessages([]);
                      alert("Chat cleared!");
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="chatpage-clear-button"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat */}
        <div className="chatpage-main">
          {selectedChat ? (
            <>
              <div className="chatpage-header">
                <div className="chatpage-chat-avatar">
                  {getInitial(getChatDisplayName(selectedChat))}
                </div>
                <div className="chatpage-chat-info">
                  <div className="chatpage-chat-name">
                    {getChatDisplayName(selectedChat)}
                  </div>
                  {selectedChat.isGroup && (
                    <div className="chatpage-group-members">
                      Members: {getGroupMemberNames(selectedChat)}
                    </div>
                  )}
                </div>

                {selectedChat.isGroup && (
                  <div className="chatpage-group-actions">
                    <button
                      onClick={async () => {
                        if (!window.confirm("Do you want to leave this group?")) return;
                        try {
                          const token = localStorage.getItem("token");
                          await axios.post(`${API_BASE}/chat/chat/group/leave`,
                            { chatId: selectedChat._id },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setChats(prev => prev.filter(c => c._id !== selectedChat._id));
                          setSelectedChat(null);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      Leave Group
                    </button>

                    <button onClick={openAddMembersModal}>
                      Add Members
                    </button>
                  </div>
                )}
              </div>

              <div className="chatpage-messages">
                {messages.map((msg) => {
                  const isSender = msg.sender._id === loggedInUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`chatpage-message-wrapper ${isSender ? "sent" : "received"}`}
                    >
                      <div className={`chatpage-message ${isSender ? "chatpage-message-sent" : "chatpage-message-received"
                        }`}
                      >
                        {selectedChat.isGroup && !isSender && (
                          <div className="chatpage-message-sender">{msg.sender.name}</div>
                        )}

                        <div className="chatpage-message-content">{msg.content}</div>
                        <div className="chatpage-message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="chatpage-input-container">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="chatpage-message-input"
                  disabled={isSending}
                />
                <button type="submit" className="chatpage-send-button" disabled={isSending}>
                  {isSending ? "⏳" : "➤"}
                </button>
              </form>
            </>
          ) : (
            <div className="chatpage-no-chat-selected">Select a chat to start messaging</div>
          )}
        </div>
      </div>
    </div>
  );
}