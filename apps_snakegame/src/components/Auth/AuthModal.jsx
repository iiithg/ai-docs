import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import './Auth.css'

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login')

  if (!isOpen) return null

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          &times;
        </button>
        {mode === 'login' ? (
          <Login
            onSwitchToRegister={() => setMode('register')}
            onClose={onClose}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setMode('login')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

export default AuthModal
