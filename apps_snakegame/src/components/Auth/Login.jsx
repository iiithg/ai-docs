import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import GoogleButton from './GoogleButton'
import GitHubButton from './GitHubButton'
import './Auth.css'

const Login = ({ onSwitchToRegister, onClose }) => {
  const { signIn, signInWithOAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      onClose()
    }

    setLoading(false)
  }

  const handleOAuthSignIn = async (provider) => {
    setError('')
    setOauthLoading(true)
    const { error } = await signInWithOAuth(provider)
    if (error) {
      setError(error.message)
    }
    setOauthLoading(false)
  }

  return (
    <div className="auth-form-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <div className="oauth-buttons">
        <GoogleButton
          onClick={() => handleOAuthSignIn('google')}
          disabled={oauthLoading}
        />
        <GitHubButton
          onClick={() => handleOAuthSignIn('github')}
          disabled={oauthLoading}
        />
      </div>

      <div className="auth-switch">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister}>
          Sign Up
        </button>
      </div>
    </div>
  )
}

export default Login
