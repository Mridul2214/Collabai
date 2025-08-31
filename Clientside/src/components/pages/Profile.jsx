import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../theme/Themecontext";
import "../css/profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  const [editMode, setEditMode] = useState(false); // NEW: edit toggle

  const [form, setForm] = useState({ name: "", email: "", bio: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { darkMode, toggleTheme } = useContext(ThemeContext);


  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
        setForm({
          name: data.name,
          email: data.email,
          bio: data.bio || "",
        });
        setPreview(data.profilePic ? `http://localhost:3000${data.profilePic}` : null);
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("bio", form.bio);
    if (file) formData.append("profilePic", file);

    try {
      const res = await fetch("http://localhost:3000/api/user/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setEditMode(false); // back to view mode
        alert("Profile updated!");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <div className="back-btn-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
      </div>
      {/* Left column */}
      <div className="profile-left">
        <div className="profile-card">
          <div className="profile-image">
            <img src={preview || "/default-avatar.png"} alt={form.name} />
          </div>
          <h2>{form.name}</h2>
          <span className="profile-role">Member</span>
          <p className="contact-info">{form.email}</p>
          <p className="contact-info">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
          {form.bio && <p className="bio-text">{form.bio}</p>}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="stats-card">
          <h3>Your Stats</h3>
          <div className="stats-grid">
            <div>
              <p className="stat-num">{user.stats?.projects || 0}</p>
              <p className="stat-label">Projects</p>
            </div>
            <div>
              <p className="stat-num">{user.stats?.tasksCompleted || 0}</p>
              <p className="stat-label">Tasks Completed</p>
            </div>
            <div>
              <p className="stat-num">{user.stats?.teamMembers || 0}</p>
              <p className="stat-label">Team Members</p>
            </div>
            <div>
              <p className="stat-num">{user.stats?.messages || 0}</p>
              <p className="stat-label">Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="profile-right">
        <div className="tab-header">
          <button
            className={activeTab === "account" ? "active" : ""}
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <button
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
          <button
            className={activeTab === "activity" ? "active" : ""}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "account" && (
            <>
              {!editMode ? (
                <div>
                  <h3>Account Information</h3>
                  <p><strong>Name:</strong> {form.name}</p>
                  <p><strong>Email:</strong> {form.email}</p>
                  <p><strong>Bio:</strong> {form.bio || "No bio"}</p>
                  <button className="logout-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3>Edit Account Information</h3>
                  <label>Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} />

                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />

                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                  />

                  <button type="submit" className="edit-btn">Save Changes</button><br />
                  <button type="button" className="logout-btn" onClick={() => setEditMode(false)}>Cancel</button>
                </form>
              )}
            </>
          )}

          {activeTab === "settings" && (
            <div>
              <h3>Preferences</h3>
              <div className="toggle-item">
                <span>Dark Mode</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleTheme}
                  />


                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-item">
                <span>Auto-save</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-item">
                <span>AI Suggestions</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h3>Notification Settings</h3>
              <div className="toggle-item">
                <span>Email Notification</span>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-item">
                <span>Project Updates</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="toggle-item">
                <span>Notifcations</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>

            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h3>Recent Activity</h3>
              <ul>
                <li>Completed task — 2 hours ago</li>
                <li>Joined project — 1 day ago</li>
                <li>Added comment — 2 days ago</li>
                <li>Created whiteboard — 3 days ago</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
