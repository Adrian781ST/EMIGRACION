import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Check if it's a "not found" error (user profile doesn't exist yet)
        if (error.code === 'PGRST116') {
          console.warn('Usuario no encontrado en tabla usuarios - puede que el trigger no haya funcionado')
          return
        }
        console.error('Error fetching user profile:', error.message)
      } else if (data) {
        setUserProfile(data)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    }
  }

  const signUp = async (email, password, nombre, tipo) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nombre, tipo }
        }
      })
      
      if (error) {
        // Provide more specific error messages
        if (error.message.includes('fetch')) {
          return { success: false, error: 'Error de conexión. Verifica tu internet o intenta más tarde.' }
        }
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Este correo ya está registrado.' }
        }
        if (error.message.includes('Invalid email')) {
          return { success: false, error: 'Por favor ingresa un correo válido.' }
        }
        throw error
      }
      return { success: true, data }
    } catch (error) {
      // Handle network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return { success: false, error: 'Error de conexión. Verifica tu internet o intenta más tarde.' }
      }
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        if (error.message.includes('fetch')) {
          return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Correo o contraseña incorrectos.' }
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Por favor verifica tu correo electrónico.' }
        }
        throw error
      }
      return { success: true, data }
    } catch (error) {
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return { success: false, error: 'Error de conexión. Verifica tu internet.' }
      }
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUserProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchUserProfile(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
