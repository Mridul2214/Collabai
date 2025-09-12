import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import "../css/whiteboard.css";

export default function Whiteboard() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { username, isCreator } = location.state || { username: "Guest", isCreator: false };

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const [socket, setSocket] = useState(null);

  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState("pen"); 
  const [members, setMembers] = useState([]);

  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [textBoxes, setTextBoxes] = useState([]);
  const [currentText, setCurrentText] = useState({ active: false, x: 0, y: 0, value: "" });

  const token = localStorage.getItem("token");

  // ---------- INIT SOCKET ----------
  useEffect(() => {
    const s = io("http://localhost:3000");
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // ---------- ROOM JOIN / CREATE ----------
  useEffect(() => {
    if (!socket) return;
    if (isCreator) {
      socket.emit("create-room", roomId, username);
      socket.on("join-request", ({ requesterId, username: requesterName }) => {
        const accept = window.confirm(`${requesterName} wants to join. Accept?`);
        socket.emit("respond-join", { roomId, requesterId, accept, username: requesterName });
      });
      socket.on("member-left", (leftUser) => alert(`⚠️ ${leftUser} has left the room.`));
    } else {
      socket.emit("request-join", { roomId, username });
      socket.once("join-approved", () => alert("✅ You are in the room!"));
      socket.once("join-rejected", (msg) => alert(`❌ ${msg}`));
    }
  }, [socket]);

  // ---------- CANVAS SETUP ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 100;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;
  }, []);

  // ---------- SOCKET LISTENERS ----------
  useEffect(() => {
    if (!socket) return;

    const handleDrawStroke = ({ stroke, room }) => {
      if (room !== roomId) return;
      applyStroke(stroke, false);
    };

    const handleClearBoard = (room) => {
      if (room !== roomId) return;
      clearCanvas(false);
    };

    const handleUpdateMembers = (members) => setMembers(members);

    const handleLoadStrokes = (serverStrokes) => {
      serverStrokes.forEach(s => applyStroke(s, false));
      setStrokes(serverStrokes);
    };

    socket.on("draw-stroke", handleDrawStroke);
    socket.on("clear-board", handleClearBoard);
    socket.on("update-members", handleUpdateMembers);
    socket.on("load-strokes", handleLoadStrokes);

    return () => {
      socket.off("draw-stroke", handleDrawStroke);
      socket.off("clear-board", handleClearBoard);
      socket.off("update-members", handleUpdateMembers);
      socket.off("load-strokes", handleLoadStrokes);
    };
  }, [socket, roomId]);

  // ---------- DRAWING FUNCTIONS ----------
  const startDrawing = (e) => {
    if (tool === "text") {
      setCurrentText({ active: true, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: "" });
      return;
    }
    drawing.current = true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const stopDrawing = () => {
    if (drawing.current) {
      drawing.current = false;
      ctxRef.current.closePath();
    }
  };

  const draw = (e) => {
    if (!drawing.current || tool === "text") return;
    const { offsetX, offsetY } = e.nativeEvent;
    const stroke = { x: offsetX, y: offsetY, color: tool === "eraser" ? "#ffffff" : color, lineWidth, type: "line" };
    applyStroke(stroke, true);
  };

  const applyStroke = async (stroke, save) => {
    if (stroke.type === "text") {
      ctxRef.current.fillStyle = stroke.color;
      ctxRef.current.font = `${stroke.lineWidth * 5}px Arial`;
      ctxRef.current.fillText(stroke.text, stroke.x, stroke.y);
      setTextBoxes(prev => [...prev, stroke]);
    } else {
      ctxRef.current.strokeStyle = stroke.color;
      ctxRef.current.lineWidth = stroke.lineWidth;
      ctxRef.current.lineTo(stroke.x, stroke.y);
      ctxRef.current.stroke();
    }

    if (save) {
      setStrokes(prev => [...prev, stroke]);
      socket?.emit("draw-stroke", { roomId, stroke });

      // ✅ Analytics for stroke
      try {
        await axios.post("/api/analytics", {
          type: "whiteboard_draw",
          roomId,
          tool: stroke.type,
          color: stroke.color,
          lineWidth: stroke.lineWidth,
          textLength: stroke.text?.length || 0,
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error("Analytics failed:", err);
      }
    }
  };

  const clearCanvas = async (emit = true) => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (emit) {
      socket?.emit("clear-board", roomId);
      setStrokes([]);
      setRedoStack([]);
      setTextBoxes([]);

      // ✅ Analytics
      try {
        await axios.post("/api/analytics", {
          type: "whiteboard_clear",
          roomId,
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error("Analytics failed:", err);
      }
    }
  };

  // ---------- UNDO / REDO ----------
  const undo = async () => {
    if (strokes.length === 0) return;
    const newStrokes = [...strokes];
    const last = newStrokes.pop();
    setRedoStack(prev => [...prev, last]);
    setStrokes(newStrokes);
    redraw(newStrokes);

    // ✅ Analytics
    try {
      await axios.post("/api/analytics", {
        type: "whiteboard_undo",
        roomId,
        remainingStrokes: newStrokes.length,
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("Analytics failed:", err);
    }
  };

  const redo = async () => {
    if (redoStack.length === 0) return;
    const newRedo = [...redoStack];
    const stroke = newRedo.pop();
    setRedoStack(newRedo);
    setStrokes(prev => [...prev, stroke]);
    redraw([...strokes, stroke]);

    // ✅ Analytics
    try {
      await axios.post("/api/analytics", {
        type: "whiteboard_redo",
        roomId,
        totalStrokes: strokes.length + 1,
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("Analytics failed:", err);
    }
  };

  const redraw = (strokesArray) => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    strokesArray.forEach(s => applyStroke(s, false));
  };

  // ---------- TEXT TOOL ----------
  const addText = async () => {
    if (!currentText.value.trim()) return;
    const stroke = {
      type: "text",
      x: currentText.x,
      y: currentText.y,
      text: currentText.value,
      color,
      lineWidth
    };
    await applyStroke(stroke, true);
    setCurrentText({ active: false, x: 0, y: 0, value: "" });
  };

  // ---------- LEAVE ROOM ----------
  const leaveRoom = async () => {
    if (!socket) return;
    socket.emit("leave-room", { roomId, username });
    socket.disconnect();

    // ✅ Analytics
    try {
      await axios.post("/api/analytics", {
        type: "whiteboard_leave",
        roomId,
        username,
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("Analytics failed:", err);
    }

    navigate("/whiteboardcreate");
  };

  return (
    <div className="whiteboard-container">
      <div className="controls">
        <button onClick={clearCanvas}>Clear</button>
        <button className={tool === "pen" ? "selected" : ""} onClick={() => setTool("pen")}>Pen</button>
        <button className={tool === "eraser" ? "selected" : ""} onClick={() => setTool("eraser")}>Eraser</button>
        <button className={tool === "text" ? "selected" : ""} onClick={() => setTool("text")}>Text</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} />
        <button className="leave-btn" onClick={leaveRoom}>Leave Room</button>
      </div>

      <div className="members">
        <h4>👥 Members:</h4>
        <ul>{members.map((m, i) => <li key={i}>{m}</li>)}</ul>
      </div>

      {currentText.active && (
        <textarea
          autoFocus
          value={currentText.value}
          onChange={(e) => setCurrentText(prev => ({ ...prev, value: e.target.value }))}
          onBlur={addText}
          onKeyDown={(e) => e.key === "Enter" && addText()}
          className="text-box"
          style={{ left: currentText.x, top: currentText.y, fontSize: `${lineWidth * 5}px` }}
        />
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
      />
    </div>
  );
}
