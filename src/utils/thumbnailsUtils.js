import { fetchApiCall } from './api.js'
import { useConfigurationStore } from '../stores/configuration.js'

const getThumbnails = async (param, queryValue) => {
  const thumbnails = []
  const configurationStore = useConfigurationStore()
  await fetchApiCall({
    url: `${configurationStore.thumbnailArchiveUrl}thumbnails/?${param}=${queryValue}&size=small`,
    method: 'GET',
    successCallback: (data) => {
      if (data.results.length > 0) {
        data.results.forEach(result => {
          // There is no filter for reduction_level in the thumbnails endpoint
          if (result.basename.includes('e91')) {
            thumbnails.push(result)
          }
        })
      }
    },
    failCallback: (error) => {
      console.error('Error fetching thumbnails for session:', queryValue, error)
    }
  })
  return thumbnails
}

export { getThumbnails }
