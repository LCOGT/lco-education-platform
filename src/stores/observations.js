import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { useConfigurationStore } from './configuration'
import { useUserDataStore } from './userData'

export const useObservationsStore = defineStore('observations', {
  state () {
    return {
      pendingObservations: [],
      completedObservations: []
    }
  },
  persist: true,
  actions: {
    async fetchPendingObservations () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      const token = userDataStore.authToken
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${token}`
      }
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `requestgroups/?observation_type=NORMAL&state=PENDING&user=${username}`,
        method: 'GET',
        header: headers,
        successCallback: (response) => {
          this.pendingObservations = response.results
        }
      })
    },
    async fetchCompletedObservations () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      const token = userDataStore.authToken
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${token}`
      }
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `requestgroups/?observation_type=NORMAL&state=COMPLETED&user=${username}`,
        method: 'GET',
        header: headers,
        successCallback: (response) => {
          this.completedObservations = response.results
        }
      })
    }
  }
})
