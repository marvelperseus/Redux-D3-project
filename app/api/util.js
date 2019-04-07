
import axios from 'axios'

const AJAX_TIMEOUT = 10000

/**
 * Axios helper
 */
export const getHTTPClient = () => {
    const httpClient = axios.create()
    httpClient.defaults.timeout = AJAX_TIMEOUT
    httpClient.defaults.headers.post['Content-Type'] = 'application/json'

    /**
     * Intercept timeouts and log event
     */
    httpClient.interceptors.response.use(
        config => config,
        (error) => {
            if (error.code === 'ECONNABORTED') {
                console.error(`This request timed out: ${error.config.url}`)
            }
            return Promise.reject(error)
        },
    )
    return httpClient
}
