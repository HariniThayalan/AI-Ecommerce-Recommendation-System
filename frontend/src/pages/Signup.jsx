import { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Signup() {
  const { user, signupWithFirebase, loginDemo } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signupWithFirebase(email, password)
      alert('Signup Successful!')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Registration failed. Please check setup or credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-wrapper">
      <form className='form' onSubmit={handleSignup} id="signup-form">
        <h2>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>
          Join AuraMart and receive intelligent shopping feeds.
        </p>

        {error && (
          <div className="error-card" style={{ padding: '12px', margin: '0 0 10px 0', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ color: '#f87171', fontSize: '0.85rem', lineHeight: '1.4' }}>
              {error.includes('firebase') || error.includes('auth/') ? 
                `Firebase server configuration error: ${error}` : error}
            </p>
          </div>
        )}

        <input
          id="signup-email"
          type="email"
          placeholder='Email Address'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          id="signup-password"
          type='password'
          placeholder='Password (min 6 characters)'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" id="signup-submit-btn" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <button 
            type="button"
            id="signup-demo-btn"
            onClick={loginDemo}
            style={{ background: 'var(--gradient-cyan)', width: '100%' }}
          >
            🚀 Try Demo Mode (Bypass Firebase)
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '15px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-secondary)' }}>Sign In</Link>
        </p>
      </form>
    </div>
  )
}

export default Signup