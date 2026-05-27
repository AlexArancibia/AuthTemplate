import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios"
import { getApiErrorMessage } from "@/lib/api-errors"

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
const normalizeApiBaseUrl = (rawBaseUrl: string | undefined) =>
  (rawBaseUrl || "").trim().replace(/\/$/, "")

const apiClient: AxiosInstance = axios.create({
  baseURL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_BACKEND_ENDPOINT),
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor to include API key in all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Always use the public API key for authentication
    if (process.env.NEXT_PUBLIC_API_KEY) {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY
      // PublicKeyGuard (frontend public) expects x-api-key.
      // Keep Authorization as well for backward compatibility with older deployments.
      config.headers["x-api-key"] = apiKey
      config.headers["Authorization"] = `Bearer ${apiKey}`
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
      const url = error.config?.url
      const method = error.config?.method?.toUpperCase()
      console.error("API Error:", {
        method,
        url,
        status: error.response.status,
        message: getApiErrorMessage(error),
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