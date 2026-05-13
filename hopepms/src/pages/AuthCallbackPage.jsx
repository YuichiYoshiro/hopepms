import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        navigate('/products')
      } else {
        navigate('/login')
      }
    }
    load()
  }, [navigate])

  return <div className="min-h-screen flex items-center justify-center">Loading...</div>
}
