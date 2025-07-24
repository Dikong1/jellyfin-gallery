import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { JellyfinService } from 'src/services/JellyfinService' // Import JellyfinService
import { clearCredentials } from 'src/utils/auth' // Keep clearCredentials for the cookie
import router from 'src/router/index' // Assuming this path is correct for your Quasar project

const api = axios.create({
  baseURL: 'http://localhost:8096', // Make sure this matches your Jellyfin server URL
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response, // If response is successful, just return it
  (error) => {
    // Check if the error is a 401 Unauthorized response
    if (error.response?.status === 401) {
      console.error(
        'Authentication error (401 Unauthorized). Clearing auth data and redirecting to login.',
      )
      // Clear all authentication data (Jellyfin token from localStorage, and credentials cookie)
      JellyfinService.clearAuthData() // Clear Jellyfin token from service and localStorage
      clearCredentials() // Clear the username/password cookie

      // Redirect the user to the authentication page
      // Ensure this is safe to call in a boot file or defer if needed
      router.push('/auth').catch((err) => {
        // Catch navigation errors (e.g., if already on /auth or navigation is redundant)
        if (err.name !== 'NavigationDuplicated') {
          console.error('Router push error:', err)
        }
      })
    }
    // Reject the promise so the error can be caught by the calling function
    return Promise.reject(error)
  },
)

// This part is for Quasar boot file integration
export default defineBoot(({ app }) => {
  // Make axios and api instances globally available in Vue components
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

// Export axios and api for direct imports if needed elsewhere
export { axios, api }
