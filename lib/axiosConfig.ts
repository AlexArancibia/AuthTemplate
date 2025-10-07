import axios, { 
  type AxiosInstance, 
  type InternalAxiosRequestConfig, 
  type AxiosResponse,
  type AxiosError 
} from "axios"

// Ensure environment variables are properly typed
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_BACKEND_ENDPOINT: string
      NEXT_PUBLIC_API_KEY: string
    }
  }
}

// Axios module augmentation for custom fields
declare module 'axios' {
  export interface InternalAxiosRequestConfig<D = any> {
    metadata?: { startTime: Date }
    retry?: number
    retryDelay?: number
  }
}

// Custom error types for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
    public originalError?: AxiosError
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: AxiosError) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string, public originalError?: AxiosError) {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Normalize base URL (remove trailing slashes) and validate
const rawBaseUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT
const normalizeBaseUrl = (url?: string) => (url ? url.replace(/\/+$/, "") : url)
const normalizedBaseUrl = normalizeBaseUrl(rawBaseUrl)

if (!normalizedBaseUrl) {
  // Fail early in development if the backend URL is missing
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      "NEXT_PUBLIC_BACKEND_ENDPOINT is not set. Set it in .env.local, e.g. NEXT_PUBLIC_BACKEND_ENDPOINT=https://api.tu-dominio.com",
    )
  }
}

// Create Axios instance with enhanced configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor with enhanced logging and error handling
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add timestamp for request tracking
    config.metadata = { startTime: new Date() }
    // Ensure retry defaults if not set
    if (typeof config.retry !== 'number') config.retry = 3
    if (typeof config.retryDelay !== 'number') config.retryDelay = 1000
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      })
    }

    // Add API key for authentication
    if (process.env.NEXT_PUBLIC_API_KEY) {
      config.headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
    } else {
      console.warn("⚠️ API key not found in environment variables")
    }

    return config
  },
  (error: AxiosError) => {
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(new ApiError("Failed to setup request", undefined, undefined, error))
  },
)

// Response interceptor with enhanced error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = response.config.metadata?.startTime 
      ? new Date().getTime() - response.config.metadata.startTime.getTime()
      : 0

    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      })
    }

    return response
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig

    // Calculate request duration
    const duration = config?.metadata?.startTime 
      ? new Date().getTime() - config.metadata.startTime.getTime()
      : 0

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
        status: error.response?.status,
        duration: `${duration}ms`,
        data: error.response?.data,
        message: error.message,
      })
    }

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status } = error.response
      const data: any = error.response.data
      let errorMessage = "An error occurred"

      // Customize error messages based on status codes
      switch (status) {
        case 400:
          errorMessage = "Invalid request. Please check your input."
          break
        case 401:
          errorMessage = "Authentication required. Please log in."
          break
        case 403:
          errorMessage = "Access denied. You don't have permission to perform this action."
          break
        case 404:
          errorMessage = "The requested resource was not found."
          break
        case 422:
          errorMessage = data?.message || "Validation error. Please check your input."
          break
        case 429:
          errorMessage = "Too many requests. Please try again later."
          break
        case 500:
          errorMessage = "Internal server error. Please try again later."
          break
        case 502:
        case 503:
        case 504:
          errorMessage = "Service temporarily unavailable. Please try again later."
          break
        default:
          errorMessage = data?.message || `Request failed with status ${status}`
      }

      return Promise.reject(new ApiError(errorMessage, status, data, error))
    } else if (error.request) {
      // Network error - no response received
      return Promise.reject(new NetworkError("Network error. Please check your connection.", error))
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      return Promise.reject(new TimeoutError("Request timeout. Please try again.", error))
    } else {
      // Other errors
      return Promise.reject(new ApiError("An unexpected error occurred", undefined, undefined, error))
    }
  },
)

// Add retry logic for failed requests
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig

    // Only retry on network errors or 5xx status codes
    const shouldRetry = !error.response || (error.response.status >= 500 && error.response.status < 600)
    
    if (shouldRetry && config && (config.retry || 0) > 0) {
      config.retry = (config.retry || 0) - 1
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000))
      
      console.log(`🔄 Retrying request: ${config.method?.toUpperCase()} ${config.url}`)
      return apiClient(config)
    }

    return Promise.reject(error)
  }
)

export default apiClient