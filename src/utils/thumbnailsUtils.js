import { fetchApiCall } from './api.js'
import { useConfigurationStore } from '../stores/configuration.js'

const getThumbnails = async (params, queryValue) => {
  const thumbnails = []
  const configurationStore = useConfigurationStore()
  await fetchApiCall({
    url: `${configurationStore.thumbnailArchiveUrl}thumbnails/?${params}=${queryValue}&size=small`,
    method: 'GET',
    successCallback: (data) => {
      if (data.results.length > 0) {
        data.results.forEach(result => thumbnails.push(result.url))
      }
    },
    failCallback: (error) => {
      console.error('Error fetching thumbnails for session:', queryValue, error)
    }
  })
  return thumbnails
}

export { getThumbnails }
