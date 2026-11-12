import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('solargrid_user')
    return stored ? JSON.parse(stored) : null
  })

  const saveSession = (data) => {
    localStorage.setItem('solargrid_token', data.token)
    localStorage.setItem('solargrid_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    saveSession(data)
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    saveSession(data)
  }

  const logout = () => {
    localStorage.removeItem('solargrid_token')
    localStorage.removeItem('solargrid_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
