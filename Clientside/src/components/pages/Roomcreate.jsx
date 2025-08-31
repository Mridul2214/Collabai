import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomCreate() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const username = prompt("Enter your name:") || "Guest";
    const newRoomId = Date.now().toString();
    navigator.clipboard.writeText(newRoomId)
      .then(() => {
        alert(`✅ Room created! Your Room ID is: ${newRoomId} (copied to clipboard)`);
      })
      .catch(() => {
        alert(`✅ Room created! Your Room ID is: ${newRoomId}. (Copy failed)`);
      }); navigate(`/whiteboard/${newRoomId}`, { state: { username, isCreator: true } });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a Room ID to join");
      return;
    }
    const username = prompt("Enter your name:") || "Guest";
    navigate(`/whiteboard/${roomId}`, { state: { username, isCreator: false } });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h2>🎨 Collaborative Whiteboard</h2>
      <div style={{ margin: "1rem 0" }}>
        <button onClick={handleCreateRoom} style={{ marginRight: "1rem" }}>
          Create New Room
        </button>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
}
