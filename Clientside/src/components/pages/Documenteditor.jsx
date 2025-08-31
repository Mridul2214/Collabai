import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Documenteditor.css";

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  // Undo/Redo stacks
  const historyRef = useRef({ undo: [], redo: [] });

  // Track which formatting buttons are active
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
  });

  useEffect(() => {
    // Only fetch if we have a valid ID (not "new")
    if (id && id !== "new") {
      setLoading(true);
      const token = localStorage.getItem("token");
      axios
        .get(`http://localhost:3000/api/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setTitle(res.data.title);
          if (editorRef.current) {
            editorRef.current.innerHTML = res.data.content || "";
          }
          setVersions(res.data.versions || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching doc:", err);
          setLoading(false);
          if (err.response?.status === 401) {
            navigate("/login");
          }
        });
    } else {
      // Initialize a new empty document
      setTitle("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      setVersions([]);
    }
  }, [id, navigate]);

const saveDoc = async () => {
  try {
    const token = localStorage.getItem("token");
    const currentContent = editorRef.current.innerHTML;

    const newVersion = {
      timestamp: new Date().toISOString(),
      title,
      content: currentContent,
    };

    if (id && id !== "new") {
      // Update existing document
      await axios.put(
        `http://localhost:3000/api/documents/${id}`,
        { title, content: currentContent, version: newVersion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update versions state immediately
      setVersions((prev) => [...prev, newVersion]);
    } else {
      // Create new document
      const res = await axios.post(
        "http://localhost:3000/api/documents",
        { title, content: currentContent, version: newVersion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/editor/${res.data._id}`);
      return; // exit to avoid alert twice
    }

    alert("Saved!");
  } catch (err) {
    console.error("Error saving doc:", err);
    if (err.response?.status === 401) {
      navigate("/login");
    }
  }
};


  // Handle typing (store undo history only)
  const handleChange = () => {
    const newContent = editorRef.current.innerHTML;
    historyRef.current.undo.push(newContent);
    updateActiveFormats();
  };

  // Undo
  const handleUndo = () => {
    const prev = historyRef.current.undo.pop();
    if (prev !== undefined) {
      historyRef.current.redo.push(editorRef.current.innerHTML);
      editorRef.current.innerHTML = prev;
    }
  };

  // Redo
  const handleRedo = () => {
    const next = historyRef.current.redo.pop();
    if (next !== undefined) {
      historyRef.current.undo.push(editorRef.current.innerHTML);
      editorRef.current.innerHTML = next;
    }
  };

const formatText = (format) => {
  if (!editorRef.current) return;
  editorRef.current.focus(); // <-- important
  document.execCommand(format, false, null);
  updateActiveFormats();
};

const formatList = (listType) => {
  if (!editorRef.current) return;
  editorRef.current.focus(); // <-- important
  document.execCommand(listType, false, null);
  updateActiveFormats();
};


  // Track which buttons should be active
  const updateActiveFormats = () => {
    // Check if editor is focused
    if (document.activeElement !== editorRef.current) return;
    
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  // Keep buttons in sync as user changes selection
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateActiveFormats();
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    if (editorRef.current) {
      editorRef.current.addEventListener('input', updateActiveFormats);
      editorRef.current.addEventListener('click', updateActiveFormats);
      editorRef.current.addEventListener('keyup', updateActiveFormats);
    }

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', updateActiveFormats);
        editorRef.current.removeEventListener('click', updateActiveFormats);
        editorRef.current.removeEventListener('keyup', updateActiveFormats);
      }
    };
  }, []);

  // Restore a version
  const restoreVersion = (version) => {
    setTitle(version.title);
    if (editorRef.current) {
      editorRef.current.innerHTML = version.content;
    }
  };

  if (loading) {
    return <div className="editor-container">Loading...</div>;
  }

  return (
    <div className="editor-container">
<input
  className="title-input"
  placeholder="Untitled"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>


      {/* Toolbar */}
      <div className="toolbar-actions">
        <button onClick={handleUndo} className="btn">Undo</button>
        <button onClick={handleRedo} className="btn">Redo</button>

        <button
          onClick={() => formatText("bold")}
          className={`btn ${activeFormats.bold ? "active" : ""}`}
        >
          Bold
        </button>
        <button
          onClick={() => formatText("italic")}
          className={`btn ${activeFormats.italic ? "active" : ""}`}
        >
          Italic
        </button>
        <button
          onClick={() => formatText("underline")}
          className={`btn ${activeFormats.underline ? "active" : ""}`}
        >
          Underline
        </button>
        <button
          onClick={() => formatList("insertUnorderedList")}
          className={`btn ${activeFormats.unorderedList ? "active" : ""}`}
        >
          • List
        </button>
        <button
          onClick={() => formatList("insertOrderedList")}
          className={`btn ${activeFormats.orderedList ? "active" : ""}`}
        >
          1. List
        </button>

        <button onClick={saveDoc} className="btn save">Save</button>
        {/* Text size */}
<select
  onChange={(e) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("fontSize", false, e.target.value);
    updateActiveFormats();
  }}
  className="btn"
  defaultValue=""
>
  <option value="" disabled>Font Size</option>
  <option value="1">Small</option>
  <option value="3">Normal</option>
  <option value="5">Large</option>
  <option value="7">Huge</option>
</select>

{/* Text color */}
<input
  type="color"
  onChange={(e) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("foreColor", false, e.target.value);
    updateActiveFormats();
  }}
  className="btn"
/>

{/* Page border toggle */}
<button
  onClick={() => {
    if (!editorRef.current) return;
    editorRef.current.style.border =
      editorRef.current.style.border === "1px solid #000"
        ? "none"
        : "1px solid #000";
  }}
  className="btn"
>
  Toggle Border
</button>

{/* Export */}
<button
  onClick={() => {
    if (!editorRef.current) return;
    const blob = new Blob([editorRef.current.innerHTML], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "document"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }}
  className="btn"
>
  Export
</button>

{/* Highlight color
<input
  type="color"
  title="Highlight"
  onChange={(e) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("hiliteColor", false, e.target.value);
  }}
  className="btn"
/> */}

{/* Text alignment */}
<select
  onChange={(e) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(e.target.value, false, null);
  }}
  className="btn"
  defaultValue=""
>
  <option value="" disabled>Align</option>
  <option value="justifyLeft">Left</option>
  <option value="justifyCenter">Center</option>
  <option value="justifyRight">Right</option>
  <option value="justifyFull">Justify</option>
</select>

{/* Clear formatting */}
<button
  onClick={() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("removeFormat", false, null);
  }}
  className="btn"
>
  Clear Format
</button>

{/* Template select */}
<select
  onChange={(e) => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = e.target.value;
  }}
  className="btn"
  defaultValue=""
>
  <option value="" disabled>Templates</option>
  <option value="<h1>Meeting Notes</h1><p>Date: </p><p>Attendees: </p><ul><li></li></ul>">Meeting Notes</option>
  <option value="<h1>Report</h1><p>Introduction:</p><p>Details:</p>">Report</option>
  <option value="<h1>Letter</h1><p>Dear [Name],</p><p></p><p>Sincerely,</p>">Letter</option>
</select>


      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        className="text-editor"
        contentEditable
        onInput={handleChange}
        placeholder="Start typing your document here..."
      />

      {/* Version History */}
      <div className="version-history">
        <h3>Version History</h3>
        {versions.length === 0 && <p>No versions yet.</p>}
        <ul>
          {versions.map((v, i) => (
            <li key={i}>
              <span>{new Date(v.timestamp).toLocaleString()}</span>
              <button onClick={() => restoreVersion(v)}>Restore</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}