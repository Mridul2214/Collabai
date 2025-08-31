import React from "react";
import "../css/dashboard.css"
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const stats = [
    { title: "Active Projects", value: 12, change: "+15%", icon: "🛡️", changeColor: "green" },
    { title: "Tasks Completed", value: 89, change: "+23%", icon: "📋", changeColor: "purple" },
    { title: "Team Members", value: 24, change: "+8%", icon: "👥", changeColor: "green" },
    { title: "AI Ideas Generated", value: 156, change: "+45%", icon: "⬆️", changeColor: "purple" },
  ];

  const features = [
    {
      title: "Ai Brain",
      desc: "Generating Ideas and AI assistance",
      icon: "🧠",
      iconBg: "lightgreen",
      path: "/aichat"
    },
{
  title: "Collaborative Whiteboard",
  desc: "Draw your ideas together",
  icon: "✒️",
  iconBg: "lightgreen",
  path: "/whiteboardcreate"   // ✅ correct
},

    {
      title: "Kanban Board",
      desc: "Manage tasks and workflows",
      icon: "📋",
      iconBg: "lightgreen",
      path: "/kanban"
    },
    {
      title: "Real-time Chat",
      desc: "Communicate instantly with built-in messaging and notifications",
      link: "#",
      icon: "💬",
      iconBg: "lightpink",
      path:"/chat"
    },
    {
      title: "Document Editor",
      desc: "Collaborative note-taking",
      link: "#",
      icon: "📊",
      iconBg: "lightsalmon",
      path:"/doc"
    },
    {
      title: "Analytics",
      desc: "Project insights and metrics",
      link: "#",
      icon: "📈",
      iconBg: "lightcyan",
      path:"/analytics"
    },
  ];

  const activeProjects = [
    {
      title: "AI Product Launch",
      members: 8,
      tasksDone: 12,
      totalTasks: 18,
      status: "In Progress",
      statusColor: "blue",
      updated: "2 hours ago",
    },
    {
      title: "Marketing Campaign",
      members: 6,
      tasksDone: 24,
      totalTasks: 24,
      status: "Completed",
      statusColor: "green",
      updated: "3 days ago",
    },
  ];

  const recentActivity = [
    { user: "Sarah Chen", action: "completed task User Research", time: "10 min ago", avatarColor: "blue" },
    { user: "Alex Kim", action: "added AI suggestion Product Features", time: "25 min ago", avatarColor: "purple" },
    { user: "Maria Garcia", action: "updated whiteboard Design Concepts", time: "1 hour ago", avatarColor: "green" },
    { user: "David Park", action: "created new project Q2 Campaign", time: "2 hours ago", avatarColor: "orange" },
  ];

  const navigate = useNavigate();

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <h1 className="header-title" onClick={() => navigate('/')}>CollaborationAI🤖</h1>
        <div className="user-avatar" onClick={()=> navigate('/profile')}>🙎</div>
      </header>

      {/* Main Title */}
      <h2 className="section-title">AI-Powered Collaboration Platform</h2>

      {/* Stats cards */}
      <div className="stats-container">
        {stats.map(({ title, value, change, icon, changeColor }, i) => (
          <div key={i} className="stat-card">
            <div>
              <div className="stat-title">{title}</div>
              <div className="stat-value">{value}</div>
              <div className={changeColor === "green" ? "stat-change-green" : "stat-change-purple"}>{change}</div>
            </div>
            <div className={`stat-icon ${changeColor === "green" ? "stat-icon-green" : "stat-icon-purple"}`}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* Content columns */}
      <div className="content-columns">
        {/* Left: Features */}
        <div className="content-section">
          <h3 className="section-title">Platform Features</h3>
          <p className="section-description">
            Access all your collaboration tools in one place
          </p>

<div className="features-grid">
  {features.map(({ title, desc, path, link, icon, iconBg }, i) => (
    <div
      key={i}
      className="feature-card"
      style={{ cursor: path ? "pointer" : "default" }}
      onClick={() => path && navigate(path)}
    >
      <div className="feature-icon" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <h4 style={{ marginBottom: 5 }}>{title}</h4>
      <p style={{ color: "#555", marginBottom: 10 }}>{desc}</p>
    </div>
  ))}
</div>

        </div>

        {/* Right: Active Projects & Recent Activity */}
        <div className="content-section">
          {/* Active Projects */}
          <div className="projects-container">
            <h3 className="section-title">Active Projects</h3>

            {activeProjects.map(({ title, members, tasksDone, totalTasks, status, statusColor, updated }, i) => (
              <div key={i} className="project-item">
                <h4>{title}</h4>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 5 }}>{members} members</div>

                {/* Progress bar container */}
                <div className="progress-bar">
                  {/* Progress bar fill */}
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(tasksDone / totalTasks) * 100}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>

                <div className="project-status">
                  <div>{tasksDone}/{totalTasks} tasks</div>
                  <div className={`status-badge ${statusColor === "green" ? "status-badge-green" : "status-badge-blue"}`}>
                    {status}
                  </div>
                </div>

                <div className="project-updated">{updated}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="activity-container">
            <h3 className="section-title">Recent Activity</h3>
            {recentActivity.map(({ user, action, time, avatarColor }, i) => (
              <div key={i} className="activity-item">
                <div
                  className="activity-avatar"
                  style={{ backgroundColor: avatarColor }}
                >
                  {user.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="activity-details">
                  <span className="activity-user">{user}</span>{" "}
                  <span>{action}</span>
                </div>
                <div className="activity-time">{time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;