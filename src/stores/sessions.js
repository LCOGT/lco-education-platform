import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'
import { calculateTime } from '../utils/formatTime'

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
      return state.sessions.results.find(session => session.id === state.currentSessionId) || {}
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
    async fetchToken () {
      const requestBody = JSON.stringify(this.currentSession)
      const response = await fetchApiCall({
        url: 'http://rti-bridge-dev.lco.gtn/login',
        method: 'POST',
        body: JSON.parse(requestBody)
      })
      if (!this.getTokenForCurrentSession) {
        this.sessionTokens[this.currentSessionId] = response.token
      }
    },
    async fetchStatus () {
      const token = this.getTokenForCurrentSession
      if (!token) {
        await this.fetchToken()
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
        await this.fetchStatus()
        const time = calculateTime(this.currentSession)
        let nextInterval = 60000
        // 10 minutes (600 seconds) before session start poll every second -- time is arbitrary
        if (time <= 600 && time > 0 && this.currentStatus === 'INACTIVE') {
          nextInterval = 1000
          // During the session, poll every 10 seconds -- time is arbitrary
        } else if (this.currentStatus === 'ACTIVE') {
          nextInterval = 10000
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
