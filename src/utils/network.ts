import useAuthStore from "@/stores/auth"
import string from "./string"

const BASE_URL = import.meta.env.VITE_BASE_URL

const buildURL = (endpoint: string) => `${BASE_URL}${endpoint}`
const buildRequestConfig = (config: any) => {
    const result = {
        ...config,
        headers: {
        }
    }
    const token = useAuthStore.getState().accessToken
    if (token) {
        result.headers.Authorization = `Bearer ${token}`
    }

    return result
}

const doRequest = async <T>(endpoint: string, config: any): Promise<T> => {
    try {
        const response = await fetch(buildURL(endpoint), buildRequestConfig(config))
        const json = await response.json()
        if (!json.is_success || response.status < 200 || response.status > 299) {
            return Promise.reject(string.toTitleCase(json.error))
        }
        return Promise.resolve(json.data)
    } catch (err: any) {
        return Promise.reject(err.message.replace(/\b\w/g, (s: string) => s.toUpperCase()))
    }
}

const network = {
    get: async  <T>(endpoint: string, config?: any): Promise<T> => {
        return doRequest(endpoint, config)
    },
    patch: async <T>(endpoint: string, body?: any): Promise<T> => {
        return doRequest(endpoint, { method: 'PATCH', body })
    },
    post: async <T>(endpoint: string, body?: any): Promise<T> => {
        return doRequest(endpoint, { method: 'POST', body })
    },
    put: async (endpoint: string, body?: any) => {
        return doRequest(endpoint, { method: 'PUT', body })
    },
    delete: async (endpoint: string) => {
        return doRequest(endpoint, { method: 'DELETE' })
    }
}

export default network