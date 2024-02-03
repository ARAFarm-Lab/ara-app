import string from "./string"

const BASE_URL = import.meta.env.VITE_BASE_URL

const buildURL = (endpoint: string) => `${BASE_URL}${endpoint}`

const doRequest = async <T>(endpoint: string, config: any): Promise<T> => {
    try {
        const response = await fetch(buildURL(endpoint), config)
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
    post: async <T>(endpoint: string, body?: any): Promise<T> => {
        return doRequest(endpoint, { method: 'post', body })
    },
    put: async (endpoint: string, body?: any) => {
        return doRequest(endpoint, { method: 'put', body })
    },
    delete: async (endpoint: string) => {
        return doRequest(endpoint, { method: 'delete' })
    }
}

export default network