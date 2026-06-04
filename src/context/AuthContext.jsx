import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validate basic structure
        if (parsed && parsed.username && parsed.allowedPages) return parsed
      }
    } catch (e) {
      localStorage.removeItem('user')
    }
    return null
  })

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const hasAccess = (page) => {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.allowedPages?.includes(page)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
