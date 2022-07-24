import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import axios from 'axios'
import { isDevServer } from 'stores/utils'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: 'http://127.0.0.1:8001/api/v1/',
  withCredentials: true
})

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

const handleErrorCode = (status, debugMessage) => {
  switch (status) {
    case 401:
      Notify.create({
        message: 'Session expired. Please login again!',
        type: 'negative'
      })
      break
    case 404:
      Notify.create({
        message: 'Resource not found!',
        type: 'negative'
      })
      break
    case 400:
      Notify.create({
        message: 'Something happened...',
        type: 'warning'
      })
      break
    case 200: {
      if (debugMessage && isDevServer) {
        if (!isDevServer) {
          Notify.create({
            message: ' ***DEBUG*** ' + debugMessage,
            type: 'warning'
          })
        }
      }
      break
    }
  }
}

api.interceptors.request.use(function (config) {
  return config
}, function (error) {
  if (error) {
    handleErrorCode(error.response.status)
  }

  return Promise.reject(error)
})

api.interceptors.response.use(function (response) {
  if (response.headers) {
    const requestResponseTime = parseFloat(response.headers['x-process-time']).toFixed(3)
    const serverSideFunctioName = response.headers['x-route-name']
    handleErrorCode(response.status, 'API Route: ' + serverSideFunctioName + ' responsed in ' + requestResponseTime + '(s)')
  }

  return response
}, function (error) {
  if (error.response) {
    handleErrorCode(error.response.status)
  }

  return Promise.reject(error)
})

export { api }
