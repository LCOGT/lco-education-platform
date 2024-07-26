import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { calculateSessionCountdown } from '../utils/formatTime'
import { toRaw } from 'vue'

export const useSessionsStore = defineStore('sessions', {
  state () {
    return {
      sessions: [],
      currentSessionId: null,
      currentStatus: '',
      fetchInterval: null,
      sessionTokens: {}
    }
  },
  persist: true,
  getters: {
    currentSession (state) {
      const currentSession = state.sessions.results.find(session => session.id === state.currentSessionId)
      // for some reason, vue3 returns a *proxy* object that we can't send over HTTP, so convert it to JSON first.
      return toRaw(currentSession)
    },
    getAllSessions (state) {
      return state.sessions
    },
    getTokenForCurrentSession (state) {
      return state.sessionTokens[state.currentSessionId] || ''
    }
  },
  actions: {
    async fetchSessions () {
      await fetchApiCall({
        url: 'http://observation-portal-dev.lco.gtn/api/observations/?observation_type=REAL_TIME&limit=1000&ordering=start',
        method: 'GET',
        successCallback: (response) => {
          this.sessions = response
        }
      })
      if (this.sessions.results.length > 0) {
        for (const session of this.sessions.results) {
          if (session.date) {
            session.date = new Date(session.date)
          }
        }
      }
    },
    async fetchSessionToken () {
      const requestBody = { ...this.currentSession }
      const response = await fetchApiCall({
        url: 'http://rti-bridge-dev.lco.gtn/login',
        method: 'POST',
        body: requestBody
      })
      if (!this.getTokenForCurrentSession) {
        this.sessionTokens[this.currentSessionId] = response.token
      }
    },
    async fetchSessionStatus () {
      const token = this.getTokenForCurrentSession
      if (!token) {
        await this.fetchSessionToken()
      }

      const response = await fetchApiCall({
        url: 'http://rti-bridge-dev.lco.gtn/session_status',
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
        // 10 minutes (600 seconds) before session start poll every second -- time is arbitrary
        if (time <= 600 && time > 0 && this.currentStatus === 'INACTIVE') {
          nextInterval = 10000
          // During the session, poll every 10 seconds -- time is arbitrary
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
    }
  }
})
