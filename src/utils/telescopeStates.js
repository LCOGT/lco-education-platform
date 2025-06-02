import { fetchApiCall } from './api.js'
import { useConfigurationStore } from '../stores/configuration.js'

export const getTelescopeState = async (site, telescope, enclosure) => {
  const configurationStore = useConfigurationStore()
  // This needs to be wrapped in a promise to ensure that the data (which is async) is returned and handled in the realTimeSessions store
  return new Promise((resolve, reject) => {
    fetchApiCall({
      url: `${configurationStore.observationPortalUrl}telescope_states/?site=${site}&telescope=${telescope}&enclosure=${enclosure}`,
      method: 'GET',
      successCallback: (response) => {
        let data
        if (!response || !response[`${site}.${enclosure}.${telescope}`]) {
          // Sometimes there is no response or the response is empty. In this case, we want the user to keep going with their rti session
          data = 'Reason unavailable'
        } else {
          data = response && response[`${site}.${enclosure}.${telescope}`][0]
        }
        resolve(data)
      }
    })
  })
}
