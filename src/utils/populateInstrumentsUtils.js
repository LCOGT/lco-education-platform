import { fetchApiCall } from './api.js'
import { useConfigurationStore } from '../stores/configuration.js'

export const getFilterList = async () => {
  const configurationStore = useConfigurationStore()
  const response = await fetchApiCall({
    url: `${configurationStore.observationPortalUrl}instruments`,
    method: 'GET'
  })
  const filterList = []
  if (!response) {
    return filterList
  }
  Object.values(response).forEach((instrument) => {
    if (instrument.class === '0m4' && instrument.optical_elements.filters) {
      const schedulableFilters = instrument.optical_elements.filters
        .filter(filter => filter.schedulable)
        .map(filter => ({ name: filter.name, code: filter.code }))
      filterList.push(...schedulableFilters)
    }
  })
  return filterList
}
