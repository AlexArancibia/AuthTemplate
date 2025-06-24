import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios"

// Ensure environment variables are properly typed
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_BACKEND_ENDPOINT: string
      NEXT_PUBLIC_API_KEY: string
    }
  }
}

// Create Axios instance with the fixed baseURL from environment variable
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor to include API key in all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Always use the public API key for authentication
    if (process.env.NEXT_PUBLIC_API_KEY) {
      config.headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
    } else {
      console.warn("API key not found in environment variables")
    }

    return config
  },
  (error: any) => {
    return Promise.reject(error)
  },
)

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
      })
    } else if (error.request) {
      console.error("No response received from API")
    } else {
      console.error("Error setting up request:", error.message)
    }
    return Promise.reject(error)
  },
)

export default apiClient