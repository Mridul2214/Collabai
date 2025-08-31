import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/pages/Profile';
import Dashboard from './components/pages/Dashboard';
import AIChat from './components/pages/Aichat';
import KanbanBoard from './components/pages/Kanbanboard';
import DocumentEditor from './components/pages/Documenteditor';
import DocumentList from './components/pages/Documentlist';
import Analytics from './components/pages/Analytics';
import RoomCreate from './components/pages/Roomcreate';
import Whiteboard from './components/pages/Whiteboard';
import { ThemeProvider } from './components/theme/Themecontext';   // ✅ use ThemeProvider
import ChatPage from './components/pages/Chatpage';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aichat" element={<AIChat />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/doc" element={<DocumentList />} />
          <Route path="/editor" element={<DocumentEditor />} />
          <Route path="/editor/:id" element={<DocumentEditor />} />
          <Route path='/analytics' element={<Analytics />} />
          <Route path='/whiteboardcreate' element={<RoomCreate />} />
          <Route path='/whiteboard/:roomId' element={<Whiteboard />} />
          <Route path='/chat' element={<ChatPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App;
