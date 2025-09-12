import React, { useState, useEffect, useRef } from "react";
import "../css/aichat.css";
import axios from "axios";

const Aichat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const [topics] = useState([
    "Tell me about AI ethics",
    "How does machine learning work?",
    "What are neural networks?",
    "Explain deep learning basics",
    "Best programming languages for AI"
  ]);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  setIsLoading(true);
  setError(null);
  const userMessage = { text: input, sender: "user" };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  try {
    const response = await fetch("http://localhost:3000/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        message: input,
        chatHistory: messages,
      }),
    });

    if (!response.ok)
      throw new Error(`API request failed with status ${response.status}`);

    const data = await response.json();
    setMessages(data.chatHistory);

    // ✅ FIXED Analytics Tracking - match backend ("ai_chat")
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:3000/api/analytics",
      {
        type: "ai_chat", // <-- FIXED
        meta: { message: input },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};


  const handleSuggestionClick = (topic) => {
    setInput(topic);
    inputRef.current?.focus();
  };

  // auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // always keep input focused
  useEffect(() => {
    inputRef.current?.focus();
  }, []);




  // detect when to show scroll button
  useEffect(() => {
    const chatBox = chatMessagesRef.current;
    const handleScroll = () => {
      if (!chatBox) return;
      const nearBottom =
        chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 100;
      setShowScrollButton(!nearBottom);
    };

    chatBox?.addEventListener("scroll", handleScroll);
    return () => chatBox?.removeEventListener("scroll", handleScroll);
  }, []);


  const renderFormattedMessage = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <div key={i} className="ai-heading">
            {line.replace(/\*\*/g, "")}
          </div>
        );
      } else if (line.startsWith("•")) {
        return (
          <div key={i} className="ai-bullet-point">
            {line}
          </div>
        );
      } else if (line.trim() === "") {
        return <br key={i} />;
      } else {
        return <div key={i}>{line}</div>;
      }
    });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch("http://localhost:3000/api/ai/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    };
    fetchHistory();
  }, []);


  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <button
          className="back-btn"
          onClick={() => (window.location.href = "/dashboard")}
        >
          ⬅ Back
        </button>
        <span>💬 AI Brainstorm</span>
        <button
          className="clear-btn"
          onClick={async () => {
            await fetch("http://localhost:3000/api/ai/history", {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            setMessages([]);
          }}
        >
          🗑 Clear
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* suggestions */}
      {topics.length > 0 && showSuggestions && (
        <div className="suggestion-topics">
          <button
            className="remove-all"
            onClick={() => setShowSuggestions(false)}
          >
            ❌
          </button>
          {topics.map((topic, index) => (
            <div key={index} className="suggestion-topic">
              <span onClick={() => handleSuggestionClick(topic)}>{topic}</span>
            </div>
          ))}
        </div>
      )}

      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.sender === "ai"
              ? renderFormattedMessage(msg.text)
              : msg.text}
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble ai">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* scroll to bottom button */}
      {showScrollButton && (
        <button
          className="scroll-bottom-btn"
          onClick={() =>
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          ⬇ Scroll to Bottom
        </button>
      )}

      <div className="chat-input">
        <input
          type="text"
          ref={inputRef}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <span className="button-loading">
              <span className="spinner"></span>
              Sending...
            </span>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </div>
  );
};

export default Aichat;