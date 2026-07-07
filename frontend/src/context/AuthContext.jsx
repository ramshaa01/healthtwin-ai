import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../api/client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem("healthtwin_token")
    if (token) {
      authAPI.profile()
        .then(res => setUser(res.data))
        .catch(() => sessionStorage.removeItem("healthtwin_token"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password })
    sessionStorage.setItem("healthtwin_token", res.data.access_token)
    setUser({ username: res.data.username,
              full_name: res.data.full_name })
    return res.data
  }

  const signup = async (username, password, full_name) => {
    await authAPI.signup({ username, password, full_name })
    return login(username, password)
  }

  const logout = () => {
    sessionStorage.removeItem("healthtwin_token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
