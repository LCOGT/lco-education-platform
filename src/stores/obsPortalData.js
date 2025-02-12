import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { useUserDataStore } from './userData'
import { useConfigurationStore } from './configuration'
import { getThumbnails } from '../utils/thumbnailsUtils'

const fifteenDaysAgo = new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export const useObsPortalDataStore = defineStore('obsPortalData', {
  state () {
    return {
      completedObservations: {},
      upcomingRealTimeSessions: {},
      pendingRequestGroups: [],
      observationDetails: {},
      selectedConfiguration: null,
      thumbnails: {},
      thumbnailCount: 0
    }
  },
  persist: true,
  actions: {
    async sessionHasThumbnails (observation_id) {
      if (this.thumbnailCount >= 5) {
        console.log('Thumbnail count limit reached. Skipping API call for', observation_id)
        return false
      }
      // If already fetched (even if empty), return the cached result.
      if (this.thumbnails[observation_id] !== undefined) {
        return this.thumbnails[observation_id].length > 0
      }
      const thumbnailResponse = await getThumbnails('observation_id', observation_id)
      if (thumbnailResponse[0] && this.thumbnailCount < 5) {
        console.log('thumbnailResponse:', thumbnailResponse)
        this.thumbnails[observation_id] = thumbnailResponse
        this.thumbnailCount++
        console.log('this.thumbnail count:', this.thumbnailCount)
        // Cache the response (or empty array) under the observation ID.
        return this.thumbnails[observation_id].length > 0
      }
      return false
    },

    async sortResponseData (response) {
      // We only want to display observations that are either COMPLETED or REAL_TIME and have ended and since each session lasts 15 minutes, we only want to display sessions that have ended in the last 16 minutes
      const sixteenMinutes = 16 * 60 * 1000
      const currentTime = new Date(new Date().getTime() - sixteenMinutes).toISOString()
      for (const result of response.results) {
        const sessionEnd = new Date(result.end).toISOString()
        if (result.state === 'COMPLETED') {
          if (!this.completedObservations[result.id]) {
            this.completedObservations[result.id] = result
          }
          // fix session end vs session cutoff
        } else if (result.observation_type === 'REAL_TIME' && sessionEnd < currentTime && this.thumbnailCount < 5) {
          await this.sessionHasThumbnails(result.id).then(() => {
            if (!this.completedObservations[result.id]) {
              this.completedObservations[result.id] = result
            }
          })
        } else if (result.observation_type === 'REAL_TIME' && sessionEnd > currentTime) {
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
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=PENDING&state=COMPLETED&limit=100&ordering=-start`,
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
