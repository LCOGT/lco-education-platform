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
      telescopeState: {},
      telescopeStatus: {},
      isTelescopeAvailable: true,
      observationTotalTime: 0,
      observationStartedAt: 0,
      observationNow: Date.now(),
      observationTicker: null,
      exposureCount: 0,
      thumbnailCount: 0,
      currentThumbnail: 0
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
    },
    progressPercent (state) {
      const total = state.observationTotalTime
      const elapsed = (state.observationNow - state.observationStartedAt) / 1000
      const percent = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0
      // If the countdown is finished but no new thumbnail yet, linger at 95%
      if (state.currentThumbnail < state.exposureCount && percent >= 100) {
        return 95
      }
      return percent
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
    },
    async fetchObservationParams (exposureTime) {
      const configurationStore = useConfigurationStore()
      const token = this.getTokenForCurrentSession
      await fetchApiCall({
        url: configurationStore.rtiBridgeUrl + 'observation-params',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token
        },
        body: { expTime: exposureTime.map(Number) },
        successCallback: resp => {
          const secs = resp.observation_params.observation_length
          if (this.exposureCount !== 0) this.observationTotalTime = secs / this.exposureCount
          this.observationStartedAt = Date.now()
          if (!this.observationTicker) {
            this.observationTicker = setInterval(() => {
              this.observationNow = Date.now()
            }, 1000)
          }
        }
      })
    },
    resetProgress () {
      clearInterval(this.observationTicker)
      this.observationTicker = null
      this.observationTotalTime = 0
      this.observationStartedAt = 0
      this.observationNow = Date.now()
      this.thumbnailCount = 0
      this.currentThumbnail = 0
    },
    initializeProgressTicker () {
      // If already running or nothing to track, bail
      if (this.observationTicker || this.observationTotalTime === 0 || this.observationStartedAt === 0) {
        return
      }
      // Start ticking
      this.observationTicker = setInterval(() => {
        this.observationNow = Date.now()
      }, 1000)
    },
    countThumbnails (count) {
      this.thumbnailCount = count
      this.currentThumbnail = count
    },
    async fetchTelescopeStatus () {
      const configurationStore = useConfigurationStore()
      const token = this.getTokenForCurrentSession
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `${token}`
      }
      await fetchApiCall({
        url: configurationStore.rtiBridgeUrl + 'status',
        method: 'GET',
        header: headers,
        successCallback: (telStatus) => {
          this.telescopeStatus = telStatus
        },
        failCallback: (error) => {
          console.error('Error fetching telescope status:', error)
        }
      })
    }
  }
})
