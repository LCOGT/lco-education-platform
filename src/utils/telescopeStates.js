import { fetchApiCall } from './api.js'
import { useConfigurationStore } from '../stores/configuration.js'

export const getTelescopeState = async (site, telescope, enclosure) => {
  const configurationStore = useConfigurationStore()
  // This needs to be wrapped in a promise to ensure that the data (which is async) is returned and handled in the realTimeSessions store
  return new Promise((resolve, reject) => {
    fetchApiCall({
      url: `${configurationStore.observationPortalUrl}telescope_states/?site=${site}&telescope=${telescope}`,
      method: 'GET',
      successCallback: (response) => {
        const data = response[`${site}.${enclosure}.${telescope}`][0]
        resolve(data)
      },
      failCallback: (error) => {
        console.error('Error fetching telescope state:', error)
        reject(error)
      }
    })
  })
}
