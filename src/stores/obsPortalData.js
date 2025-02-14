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
      pendingSchduledObservations: {},
      observationDetails: {},
      selectedConfiguration: null
    }
  },
  persist: true,
  actions: {
    storeUpcomingRealTimeSessions (realTimeSessions) {
      for (const session of realTimeSessions.results) {
        if (!this.upcomingRealTimeSessions[session.id]) {
          this.upcomingRealTimeSessions[session.id] = session
        }
      }
    },
    async fetchUpcomingRealTimeSessions () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      const now = new Date().toISOString()
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=PENDING&observation_type=REAL_TIME&limit=100&ordering=-start&end_after=${now}`,
        method: 'GET',
        successCallback: (response) => {
          this.storeUpcomingRealTimeSessions(response)
        }
      })
    },
    storePendingScheduledObservations (response) {
      for (const pendingScheduledObservation of response.results) {
        if (!this.pendingSchduledObservations[pendingScheduledObservation.request.id]) {
          this.pendingSchduledObservations[pendingScheduledObservation.request.id] = pendingScheduledObservation
        }
      }
    },
    async fetchPendingScheduledObservations () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?observation_type=NORMAL&state=PENDING&user=${username}&created_after=${fifteenDaysAgo}`,
        method: 'GET',
        successCallback: (response) => {
          this.storePendingScheduledObservations(response)
        }
      })
    },
    storeCompletedObservations (allRequests) {
      for (const request of allRequests.results) {
        if (!this.completedObservations[request.id]) {
          this.completedObservations[request.id] = request
        }
      }
    },
    async fetchAllCompletedObservations () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=COMPLETED&limit=100&ordering=-start`,
        method: 'GET',
        successCallback: (response) => {
          this.storeCompletedObservations(response)
        }
      })
    },
    setSelectedConfiguration (configuration) {
      this.selectedConfiguration = configuration
    }
  }
})
