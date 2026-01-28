'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface Persona {
  id: string
  goals: string[]
  experience_level: string
  focus_areas: string[]
  preferred_tone: string
}

interface SessionContextType {
  sessionId: string | null
  persona: Persona | null
  isLoading: boolean
  hasCompletedOnboarding: boolean
  createSession: () => Promise<string>
  updatePersona: (persona: Omit<Persona, 'id'>, overrideSessionId?: string) => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const SESSION_KEY = 'writemate_session_id'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [persona, setPersona] = useState<Persona | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const createSession = async (): Promise<string> => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({})
      .select('id')
      .single()

    if (error) throw error

    const newSessionId = data.id
    localStorage.setItem(SESSION_KEY, newSessionId)
    setSessionId(newSessionId)
    return newSessionId
  }

  const updatePersona = async (personaData: Omit<Persona, 'id'>, overrideSessionId?: string) => {
    const sid = overrideSessionId || sessionId
    if (!sid) {
      throw new Error('No session found')
    }

    const { data: existingPersona } = await supabase
      .from('user_personas')
      .select('id')
      .eq('session_id', sid)
      .single()

    if (existingPersona) {
      const { data, error } = await supabase
        .from('user_personas')
        .update({
          ...personaData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPersona.id)
        .select()
        .single()

      if (error) throw error
      setPersona(data)
    } else {
      const { data, error } = await supabase
        .from('user_personas')
        .insert({
          session_id: sid,
          ...personaData,
        })
        .select()
        .single()

      if (error) throw error
      setPersona(data)
    }
  }

  const refreshSession = async () => {
    const storedSessionId = localStorage.getItem(SESSION_KEY)

    if (storedSessionId) {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', storedSessionId)
        .single()

      if (session && !error) {
        setSessionId(storedSessionId)

        await supabase
          .from('sessions')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', storedSessionId)

        const { data: personaData } = await supabase
          .from('user_personas')
          .select('*')
          .eq('session_id', storedSessionId)
          .single()

        if (personaData) {
          setPersona(personaData)
        }
      } else {
        localStorage.removeItem(SESSION_KEY)
      }
    }

    setIsLoading(false)
  }

  useEffect(() => {
    refreshSession()
  }, [])

  const hasCompletedOnboarding = persona !== null

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        persona,
        isLoading,
        hasCompletedOnboarding,
        createSession,
        updatePersona,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
