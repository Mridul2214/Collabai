
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/documentlist.css";


export default function DocumentList() {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, redirecting to login...");
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:3000/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDocs(res.data))
      .catch((err) => {
        console.error("Error fetching docs:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      });
  }, [navigate]);

  const handleCreateNewDocument = () => {
    // You would typically navigate to a new document creation page or API endpoint
    // For now, let's just navigate to a placeholder new editor page.
    navigate("/editor/new"); // Example: navigate to an editor for a new document
  };

  return (
    <div className="document-list-container">
      <h2>Your Documents</h2>

      {/* New Document Button */}
      <button className="new-document-button" onClick={handleCreateNewDocument}>
        <i className="fas fa-plus-circle"></i> {/* Plus icon */}
        Create New Document
      </button>

      {docs.length === 0 ? (
        <p className="no-documents-message">
          <i className="fas fa-folder-open no-documents-icon"></i> {/* Folder icon */}
          It looks like you don't have any documents yet.
        </p>
      ) : (
        <ul className="document-list">
          {docs.map((doc) => (
            <li
              key={doc._id}
              onClick={() => navigate(`/editor/${doc._id}`)}
              className="document-list-item"
            >
              <div className="document-list-item-title">
                <i className="fas fa-file-alt document-list-item-icon"></i> {/* File icon */}
                {doc.title}
              </div>
              {/* You can add more document details here, e.g., <p className="document-list-item-date">{new Date(doc.updatedAt).toLocaleDateString()}</p> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}