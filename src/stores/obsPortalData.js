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
      pendingScheduledObservations: {},
      observationDetails: {},
      selectedConfiguration: null,
      completedObservationsCount: 0
    }
  },
  persist: true,
  actions: {
    storeUpcomingRealTimeSessions (realTimeSessions) {
      this.upcomingRealTimeSessions = {}
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
      // I know now why this has to be 16 minutes. If it's `end_after=${now}`, the session only appears on the dashboard before now.
      // Meaning, the session will not show up in the list if it has already started. So users can't join a session that has already started.
      // sixteenMinutesFromNow is the time 16 minutes from now in ISO format so they can access the session
      const now = new Date().toISOString()
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=PENDING&state=IN_PROGRESS&observation_type=REAL_TIME&limit=100&ordering=-start&end_after=${now}`,
        method: 'GET',
        successCallback: (response) => {
          this.storeUpcomingRealTimeSessions(response)
        }
      })
    },
    storePendingScheduledObservations (response) {
      // The format of the response is as follows:
      // [
      //     {
      //       "id": 680316844,
      //       "request": {
      //           "id": 3784722,
      //           "state": "PENDING",
      //           "configurations": [
      //             {...configuration details...}
      //           ]
      //       },
      //       and other fields
      //   }
      // ]
      this.pendingScheduledObservations = {}

      for (const pendingScheduledObservation of response.results) {
        // Because a scheduled request is ephemeral and its id can change, we store the request id which is stable
        // So the example above would be stored as:
        // {
        //   3784722: {... details of the request ...}
        this.pendingScheduledObservations[pendingScheduledObservation.request.id] = pendingScheduledObservation
      }
    },
    async fetchPendingScheduledObservations () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      await fetchApiCall({
        // This will only work with NORMAL observations, so TIME_CRITICAL or RAPID_RESPONSE will not show up.
        //  Also only getting ones submitted by the user, which ignores observations on a shared proposal the user has access too.
        // In the future, we have to change the query
        url: configurationStore.observationPortalUrl + `observations/?observation_type=NORMAL&state=PENDING&user=${username}&created_after=${fifteenDaysAgo}`,
        method: 'GET',
        successCallback: (response) => {
          this.storePendingScheduledObservations(response)
        }
      })
    },
    storeCompletedObservations (observations) {
      this.completedObservationsCount = observations.count
      for (const observation of observations.results) {
        this.completedObservations[observation.id] = observation
      }
    },
    async fetchCompletedObservations (page = 1) {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      // We want 5 items per page
      const limit = 5
      // For pagination purposes we need offset
      const offset = (page - 1) * limit
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=COMPLETED&limit=${limit}&offset=${offset}&ordering=-start`,
        method: 'GET',
        successCallback: (response) => {
          this.completedObservations = {}
          this.completedObservationsCount = response.count
          this.completedObservations = response.results
          // this.storeCompletedObservations(response)
        }
      })
    },
    setSelectedConfiguration (configuration) {
      this.selectedConfiguration = configuration
    }
  }
})
