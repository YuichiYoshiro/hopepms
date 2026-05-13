import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl()
      if (error) {
        console.error('Auth callback error', error)
      }
      if (data?.session) {
        navigate('/products')
      } else {
        navigate('/login')
      }
    }
    load()
  }, [navigate])

  return <div className="min-h-screen flex items-center justify-center">Loading...</div>
}
