import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import SnakeGame from './components/SnakeGame'
import Leaderboard from './components/Leaderboard'
import AuthModal from './components/Auth/AuthModal'
import AuthCallback from './pages/AuthCallback'
import './App.css'

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('game')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="App loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  return (
    <div className="App">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>🐍 Snake Game</h1>
        </div>
        <div className="nav-links">
          <button
            className={currentPage === 'game' ? 'active' : ''}
            onClick={() => setCurrentPage('game')}
          >
            Play
          </button>
          <button
            className={currentPage === 'leaderboard' ? 'active' : ''}
            onClick={() => setCurrentPage('leaderboard')}
          >
            Leaderboard
          </button>
        </div>
        <div className="nav-user">
          {user ? (
            <div className="user-info">
              <span className="user-username">
                {user.user_metadata?.username || user.email}
              </span>
              <button onClick={signOut} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="login-btn"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={
            currentPage === 'game' ? <SnakeGame /> : <Navigate to="/leaderboard" replace />
          } />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
