import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const client = axios.create({ baseURL: BASE_URL })

// Automatically attach JWT token to every request if present
client.interceptors.request.use(config => {
  const token = sessionStorage.getItem("healthtwin_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  signup: (data) => client.post("/api/auth/signup", data),
  login:  (data) => client.post("/api/auth/login", data),
  profile: ()    => client.get("/api/auth/profile"),
}

export const healthAPI = {
  predict:         (data) => client.post("/api/predict", data),
  simulate:        (data) => client.post("/api/simulate", data),
  forecast:        ()     => client.post("/api/forecast"),
  recommendations: ()     => client.post("/api/recommendations"),
  history:         ()     => client.get("/api/history"),
}

export default client
