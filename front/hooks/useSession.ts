import { useState, useEffect } from 'react'

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Загружаем sessionId из localStorage при монтировании
    const savedSessionId = localStorage.getItem('sessionId')
    if (savedSessionId) {
      setSessionId(savedSessionId)
    }
  }, [])

  const saveSession = (id: string) => {
    localStorage.setItem('sessionId', id)
    setSessionId(id)
  }

  const clearSession = () => {
    localStorage.removeItem('sessionId')
    setSessionId(null)
  }

  const getAuthHeaders = (): HeadersInit => {
    if (!sessionId) return {}
    
    return {
      'X-Session-Id': sessionId,
      'Content-Type': 'application/json'
    }
  }

  return {
    sessionId,
    saveSession,
    clearSession,
    getAuthHeaders
  }
}