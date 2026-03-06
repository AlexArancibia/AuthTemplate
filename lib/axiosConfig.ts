import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios"
import { logger } from "@/lib/logger"

// TODO(security): A futuro mover la API key a una variable solo de servidor
// (sin prefijo NEXT_PUBLIC_) y hacer que todas las llamadas al backend pasen
// por API routes de Next.js, en lugar de exponer la API key en el bundle.
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
      logger.warn("API key not found in environment variables")
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
      logger.error({ status: error.response.status, data: error.response.data }, "API Error")
    } else if (error.request) {
      logger.error("No response received from API")
    } else {
      logger.error({ message: error.message }, "Error setting up request")
    }
    return Promise.reject(error)
  },
)

export default apiClient