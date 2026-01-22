import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { Dashboard } from './pages/Dashboard'
import { CreateAvatar } from './pages/CreateAvatar'
import { ChatPage } from './pages/ChatPage'
import { Sessions } from './pages/Sessions'

import ElderChat from './components/ElderChat'
import AdminDashboard from './components/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateAvatar />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/elder-chat" element={<ElderChat />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App