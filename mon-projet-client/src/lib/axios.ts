import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Pour envoyer les cookies (refresh token)
})

// Intercepteur pour ajouter le token d'accès si disponible
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage ou le contexte d'auth
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.accessToken || userData.token) {
          config.headers.Authorization = `Bearer ${userData.accessToken || userData.token}`
        }
      } catch (error) {
        console.error('Erreur parsing user data:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour rafraîchir le token si expiré
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true
      
      try {
        console.log('Tentative de refresh du token...')
        
        // Essayer plusieurs endpoints possibles pour le refresh
        let refreshResponse
        try {
          refreshResponse = await api.post("/auth/refresh")
        } catch (refreshError) {
          // Si /auth/refresh ne fonctionne pas, essayer d'autres chemins
          try {
            refreshResponse = await api.post("/auth/refresh-token")
          } catch (secondTryError) {
            // Dernière tentative
            refreshResponse = await api.post("/refresh")
          }
        }
        
        console.log('Token refreshed successfully')
        
        // Mettre à jour le token dans localStorage si nécessaire
        if (refreshResponse.data?.accessToken || refreshResponse.data?.token) {
          const user = localStorage.getItem("user")
          if (user) {
            const userData = JSON.parse(user)
            userData.accessToken = refreshResponse.data.accessToken || refreshResponse.data.token
            localStorage.setItem("user", JSON.stringify(userData))
          }
        }
        
        return api(originalRequest)
      } catch (refreshErr) {
        console.error('Refresh token failed:', refreshErr)
        
        // Rediriger vers login si le refresh échoue
        localStorage.removeItem("user")
        window.location.href = "/login"
        
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(err)
  }
)

export default api