import { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth session error', error)
        setLoading(false)
        return
      }

      setSession(session)
      if (session?.user) {
        await fetchCurrentUser(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const isActive = await checkUserIsActive(session.user.id)
          if (!isActive) {
            await supabase.auth.signOut()
            setSession(null)
            setCurrentUser(null)
            return
          }
          await fetchCurrentUser(session.user.id)
          setSession(session)
        } else {
          setSession(null)
          setCurrentUser(null)
        }
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkUserIsActive = async (userId) => {
    const { data, error } = await supabase
      .from('user')
      .select('record_status')
      .eq('userId', userId)
      .single()

    if (error) {
      console.error('Check user active error', error)
      return false
    }
    return data?.record_status === 'ACTIVE'
  }

  const fetchCurrentUser = async (userId) => {
    const { data, error } = await supabase
      .from('user')
      .select('userId, username, lastName, firstName, user_type, record_status')
      .eq('userId', userId)
      .single()

    if (error) {
      console.error('Fetch current user error', error)
      return
    }

    if (data) {
      setCurrentUser(data)
    }
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw error
    }

    const isActive = await checkUserIsActive(data.user.id)
    if (!isActive) {
      await supabase.auth.signOut()
      throw new Error('Your account is pending activation. Please contact an administrator.')
    }
    return data
  }

  const signUp = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      throw error
    }
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setCurrentUser(null)
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        currentUser,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
