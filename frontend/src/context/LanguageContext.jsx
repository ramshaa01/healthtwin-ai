import { createContext, useContext, useState } from "react"
import strings from "../i18n/strings"

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("ht_lang") || "en"
  })

  const toggle = () => {
    const next = lang === "en" ? "hi" : "en"
    setLang(next)
    localStorage.setItem("ht_lang", next)
  }

  const t = (key) => strings[lang][key] || strings["en"][key] || key

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
