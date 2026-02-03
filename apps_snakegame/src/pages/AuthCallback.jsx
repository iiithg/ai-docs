import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          return
        }

        if (data.session) {
          // Successfully logged in, redirect to home
          navigate('/', { replace: true })
        } else {
          // No session, might be still processing
          setError('No session found. Please try logging in again.')
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        setError('An unexpected error occurred.')
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a2e',
        color: '#fff',
        padding: '20px',
        textAlign: 'center',
      }}>
        <h1>Authentication Error</h1>
        <p style={{ color: '#ff6b6b', marginTop: '16px' }}>{error}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: '#4ecdc4',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a2e',
      color: '#fff',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Completing sign in...</h2>
        <p style={{ color: '#888', marginTop: '12px' }}>Please wait while we verify your identity.</p>
      </div>
    </div>
  )
}

export default AuthCallback
