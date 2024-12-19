import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { useUserDataStore } from './userData'
import { useConfigurationStore } from './configuration'

const fifteenDaysAgo = new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export const useObsPortalDataStore = defineStore('obsPortalData', {
  state () {
    return {
      completedObservations: {},
      upcomingRealTimeSessions: {},
      pendingRequestGroups: [],
      observationDetails: {},
      selectedConfiguration: null
    }
  },
  persist: true,
  actions: {
    sortResponseData (response) {
    // we only want to display observations that are either COMPLETED or REAL_TIME and have ended and since each session lasts 15 minutes, we only want to display sessions that have ended in the last 16 minutes
      const sixteenMinutes = 16 * 60 * 1000
      const sessionCutoff = new Date(new Date().getTime() - sixteenMinutes).toISOString()
      for (const result of response.results) {
        const sessionEnd = new Date(result.end).toISOString()
        if ((result.state === 'COMPLETED') || (result.observation_type === 'REAL_TIME' && sessionEnd < sessionCutoff)) {
          if (!this.completedObservations[result.id]) {
            this.completedObservations[result.id] = result
          }
        } else if (result.observation_type === 'REAL_TIME' && sessionEnd > sessionCutoff) {
          if (!this.upcomingRealTimeSessions[result.id]) {
            this.upcomingRealTimeSessions[result.id] = result
          }
        }
      }
    },
    async fetchCompleteObservationsAndUpcomingRTSessions () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=PENDING&state=COMPLETED&limit=1000&ordering=start`,
        method: 'GET',
        successCallback: (response) => {
          this.sortResponseData(response)
        }
      })
    },
    fetchPendingRequestGroups () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      fetchApiCall({
        url: configurationStore.observationPortalUrl + `requestgroups/?observation_type=NORMAL&state=PENDING&user=${username}&created_after=${fifteenDaysAgo}`,
        method: 'GET',
        successCallback: (response) => {
          this.pendingRequestGroups = response.results
        }
      })
    },
    setSelectedConfiguration (configuration) {
      this.selectedConfiguration = configuration
    }
  }
})
