/* eslint-disable no-unused-expressions */
import { useUserDataStore } from '../stores/userData.js'
import { useSessionsStore } from '../stores/sessions.js'

async function fetchApiCall ({ url, method, body = null, header, successCallback = null, failCallback = null }) {
  const store = useUserDataStore()
  const sessionsStore = useSessionsStore()

  const defaultHeader = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  // if (sessionsStore.getTokenForCurrentSession) {
  //   defaultHeader.Authorization = `Token ${sessionsStore.getTokenForCurrentSession}`
  // } else
  if (store.authToken) {
    defaultHeader.Authorization = `Token ${store.authToken}`
  }
  const config = {
    method,
    headers: header || defaultHeader,
    body: body ? JSON.stringify(body) : null
  }

  try {
    const response = await fetch(url, config)
    // ok response but empty content
    if (response.ok && (!response.headers.has('content-length') || response.headers.get('content-length') == 0)) {
      successCallback ? successCallback(null) : null
    } else {
      const responseData = await response.json()
      if (!response.ok) {
        console.error('Response not OK', responseData)
        failCallback ? failCallback(responseData, response.status) : null
      } else {
        // Invoking success callback with responseData
        successCallback ? successCallback(responseData) : null
      }
      return responseData
    }
  } catch (error) {
    console.error('Error raised when sending request', error)
    failCallback ? failCallback(error) : null
  }
}

// manages api call failures by logging errors
const handleError = (error) => {
  console.error('API call failed with error:', error)
}

export { fetchApiCall, handleError }
