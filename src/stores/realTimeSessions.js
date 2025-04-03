import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { calculateSessionCountdown } from '../utils/formatTime'
import { toRaw } from 'vue'
import { useConfigurationStore } from './configuration'
import { useObsPortalDataStore } from './obsPortalData'
import { getTelescopeState } from '../utils/telescopeStates'

export const useRealTimeSessionsStore = defineStore('realTimeSessions', {
  state () {
    return {
      currentSessionId: null,
      currentStatus: '',
      fetchInterval: null,
      sessionTokens: {},
      isCapturingImagesMap: {},
      telescopeState: {}
    }
  },
  persist: true,
  getters: {
    currentSession (state) {
      const obsPortalDataStore = useObsPortalDataStore()
      const upcomingRealTimeSessions = obsPortalDataStore.upcomingRealTimeSessions
      const currentSession = upcomingRealTimeSessions[state.currentSessionId]
      // for some reason, vue3 returns a *proxy* object that we can't send over HTTP, so convert it to JSON first.
      return toRaw(currentSession)
    },
    getTokenForCurrentSession (state) {
      return state.sessionTokens[state.currentSessionId] || ''
    },
    isCapturingImagesForCurrentSession (state) {
      return state.isCapturingImagesMap[state.currentSessionId] || false
    },
    telescopeAvailability (state) {
      return state.telescopeState
    }
  },
  actions: {
    resetSessionState () {
      if (this.currentSessionId) {
        this.isCapturingImagesMap[this.currentSessionId] = false
      }
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
        // fetching for telescope state every time we poll
        this.telescopeState = await getTelescopeState(this.currentSession.site, this.currentSession.telescope, this.currentSession.enclosure)
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
