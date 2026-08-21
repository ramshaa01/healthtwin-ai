import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("ht_theme") === "dark"
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("ht_theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("ht_theme", "light")
    }
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
