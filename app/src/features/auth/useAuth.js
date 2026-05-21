import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../../api/client'
import { setToken, setUser } from '../../lib/session'

// Login / registration logic. Validates input, calls the API, persists the
// session, and routes to the right next screen.
export function useAuth() {
  const navigate = useNavigate()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function submit({ isSignUp, name, email, password }) {
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (!password)     { setError('Please enter your password.'); return }
    setError(''); setLoading(true)
    try {
      const endpoint = isSignUp ? '/register' : '/login'
      const body = isSignUp
        ? { email: email.trim(), password, name: name.trim() }
        : { email: email.trim(), password }

      const data = await apiPost(endpoint, body)
      setToken(data.token)
      setUser(data.user)
      navigate(isSignUp ? '/onboarding' : '/wardrobe')
    } catch (err) {
      // err.status is set when the server responded with an error payload;
      // its absence means the request never reached the server.
      setError(err.status ? (err.message || 'Something went wrong') : 'Could not connect to server. Is it running?')
      setLoading(false)
    }
  }

  return { error, setError, loading, submit }
}
