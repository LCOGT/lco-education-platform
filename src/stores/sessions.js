import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { calculateSessionCountdown } from '../utils/formatTime'
import { toRaw } from 'vue'
import { useConfigurationStore } from './configuration'
import { useUserDataStore } from './userData'

export const useSessionsStore = defineStore('sessions', {
  state () {
    return {
      fulfilledRequests: [],
      upcomingRealTimeSessions: [],
      currentSessionId: null,
      currentStatus: '',
      fetchInterval: null,
      sessionTokens: {},
      isCapturingImagesMap: {}
    }
  },
  persist: true,
  getters: {
    currentSession (state) {
      const currentSession = state.upcomingRealTimeSessions.find(session => session.id === state.currentSessionId)
      // for some reason, vue3 returns a *proxy* object that we can't send over HTTP, so convert it to JSON first.
      return toRaw(currentSession)
    },
    getTokenForCurrentSession (state) {
      return state.sessionTokens[state.currentSessionId] || ''
    },
    isCapturingImagesForCurrentSession (state) {
      return state.isCapturingImagesMap[state.currentSessionId] || false
    }
  },
  actions: {
    resetSessionState () {
      if (this.currentSessionId) {
        this.isCapturingImagesMap[this.currentSessionId] = false
      }
    },
    sortSessions (response) {
      const sessionCutoff = new Date(new Date().getTime() - 16 * 60 * 1000).toISOString()
      for (const result of response.results) {
        const sessionEnd = new Date(result.end).toISOString()
        if ((result.state === 'COMPLETED') || (result.observation_type === 'REAL_TIME' && sessionEnd < sessionCutoff)) {
          if (!this.fulfilledRequests.some(req => req.id === result.id)) {
            this.fulfilledRequests.push(result)
          }
        } else if (result.observation_type === 'REAL_TIME' && sessionEnd > sessionCutoff) {
          if (!this.upcomingRealTimeSessions.some(req => req.id === result.id)) {
            this.upcomingRealTimeSessions.push(result)
          }
        }
      }
    },
    async fetchSessions () {
      const configurationStore = useConfigurationStore()
      const userDataStore = useUserDataStore()
      const username = userDataStore.username
      await fetchApiCall({
        url: configurationStore.observationPortalUrl + `observations/?user=${username}&state=PENDING&state=COMPLETED&limit=1000&ordering=start`,
        method: 'GET',
        successCallback: (response) => {
          this.sortSessions(response)
        }
      })
    },
    async fetchSessionToken () {
      const configurationStore = useConfigurationStore()
      const requestBody = { ...this.currentSession }
      const response = await fetchApiCall({
        url: configurationStore.rtiBridgeUrl + 'login',
        method: 'POST',
        body: requestBody
      })
      if (!this.getTokenForCurrentSession) {
        this.sessionTokens[this.currentSessionId] = response.token
      }
    },
    async fetchSessionStatus () {
      const configurationStore = useConfigurationStore()
      const token = this.getTokenForCurrentSession
      if (!token) {
        await this.fetchSessionToken()
      }

      const response = await fetchApiCall({
        url: configurationStore.rtiBridgeUrl + 'session_status',
        method: 'GET',
        header: { Authorization: `Token ${token}` }
      })
      this.currentStatus = response.session_status
    },
    startPolling () {
      this.stopPolling()

      const poll = async () => {
        await this.fetchSessionStatus()
        const time = calculateSessionCountdown(this.currentSession)
        let nextInterval = 60000
        // 10 minutes (600 seconds) before session start poll every 10 seconds -- time is arbitrary
        if (time <= 600 && time > 0 && this.currentStatus === 'INACTIVE') {
          nextInterval = 10000
          // During the session, poll every 1 second -- time is arbitrary
        } else if (this.currentStatus === 'ACTIVE') {
          nextInterval = 1000
        }

        this.fetchInterval = setTimeout(poll, nextInterval)
      }

      poll()
    },
    stopPolling () {
      if (this.fetchInterval) {
        clearTimeout(this.fetchInterval)
        this.fetchInterval = null
      }
    },
    updateImageCaptureState (isCapturing) {
      if (this.currentSessionId) {
        this.isCapturingImagesMap[this.currentSessionId] = isCapturing
      }
    }
  }
})
