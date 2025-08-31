import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./css/home.css";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setUserInitials('👤');
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return '👤';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <div className="homepage-container">
      <header className="header-nav">
        <div className="logo">CollaborationAI🤖</div>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#pricing">Pricing</a>
          {isLoggedIn ? (
            <Link to="/profile" className="profile-icon">
              <div className="avatar">{userInitials}</div>
            </Link>
          ) : (
            <Link to="/login">Sign In</Link>
          )}
        </nav>
        {/* <Link to={isLoggedIn ? "/dashboard" : "/login"}>
          <button className="get-started-btn">
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </button>
        </Link> */}
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="herocontent">
          <span className="advanced-ai-tag">Now with Advanced AI</span>
          <h1>Collaborate Smarter with AI-Powered Innovation</h1>
          <p>
            Transform your team's productivity with our all-in-one platform that combines AI brainstorming, real-time collaboration, and intelligent project management.
          </p>
          <div className="hero-buttons">
            <Link to={isLoggedIn ? "/dashboard" : "/login"}>
              <button className="start-trial-btn">Go to Dashboard →</button>
            </Link>
            {/* <button className="watch-demo-btn">Watch Demo</button> */}
          </div>
          <div className="stats-container">
            <div className="stat-item">
              {/* <span className="stat-number">10K+</span> */}
              {/* <span className="stat-label">Active Teams</span> */}
            </div>
            <div className="stat-item">
              {/* <span className="stat-number">500K+</span> */}
              {/* <span className="stat-label">Ideas Generated</span> */}
            </div>
            <div className="stat-item">
              {/* <span className="stat-number">99.9%</span> */}
              {/* <span className="stat-label">Uptime</span> */}
            </div>
            <div className="stat-item">
              {/* <span className="stat-number">150+</span> */}
              {/* <span className="stat-label">Countries</span> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2>Everything You Need to Collaborate</h2>
        <p className="section-subtitle">Powerful features designed to streamline your workflow and boost team productivity</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Brainstorming</h3>
            <p>Generate breakthrough ideas with advanced AI assistance and smart suggestions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✍️</div>
            <h3>Collaborative Whiteboard</h3>
            <p>Draw, sketch, and brainstorm together in real-time with your team</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Smart Kanban Boards</h3>
            <p>Organize tasks with intelligent automation and progress tracking</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Real-time Chat</h3>
            <p>Communicate instantly with built-in messaging and notifications</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Version-Controlled Docs</h3>
            <p>Collaborate on documents with automatic versioning and history</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Get insights on team performance and project progress</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <h2>Loved by Teams Worldwide</h2>
        <p className="section-subtitle">See what our users have to say about CollabAI</p>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="quote">"CollabAI transformed how our team works. The AI suggestions are incredibly helpful!"</p>
            <p className="author">Sarah Chen</p>
            <p className="author-title">Product Manager at TechCorp</p>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="quote">"The collaborative whiteboard is a game-changer for our design sessions."</p>
            <p className="author">Alex Rodriguez</p>
            <p className="author-title">Design Lead at Innovation Labs</p>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="quote">"Finally, a platform that brings all our tools together seamlessly."</p>
            <p className="author">Maria Kim</p>
            <p className="author-title">Project Manager at StartupXYZ</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Transform Your Team's Collaboration?</h2>
        <p>Join thousands of teams already using CollabAI to innovate faster and work smarter.</p>
        <div className="cta-buttons">
          <Link to="/register">
            <button className="start-trial-btn">Start Your Free Trial →</button>
          </Link>
          <button className="contact-sales-btn">Contact Sales</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
