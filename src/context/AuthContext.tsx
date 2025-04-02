'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, nickname: string, selectedPains?: number[]) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (signInError) {
      if (signInError.message === 'Invalid login credentials') {
        return { error: new Error('User not found') }
      } else {
        return { error: new Error(signInError.message) }
      }
    }
    
    return { error: null }
  }

  const signUp = async (
    email: string,
    password: string,
    nickname: string,
    selectedPains: number[] = []
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname
          }
        }
      })

      if (error?.message?.includes('User already registered')) {
        return { user: null, error: new Error('User already exists') }
      }

      if (data.user) {
        const { error: selectionsError } = await supabase
          .from('user_selections')
          .insert({
            user_id: data.user.id,
            selections: selectedPains
          })

        if (selectionsError && data.user) {
          console.error('Error storing user selections:', selectionsError)
          return { user: data.user, error: selectionsError }
        }
      }

      return { user: data.user, error: error || null }
    } catch (err) {
      console.error('Error in signUp:', err)
      return { user: null, error: err as Error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}