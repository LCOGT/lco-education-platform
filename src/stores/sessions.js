import { defineStore } from 'pinia'
import { fetchApiCall } from '../utils/api'

export const useSessionsStore = defineStore('sessions', {
  state () {
    return {
      sessions: [],
      currentSessionId: null,
      nextSessionId: 0,
      selectedSite: null
    }
  },
  persist: true,
  getters: {
    currentSession (state) {
      return state.sessions.results.find(session => session.id === state.currentSessionId) || {}
    },
    getAllSessions (state) {
      return state.sessions
    }
  },
  actions: {
    async fetchSessions () {
      await fetchApiCall({
        // TODO: Filter this by user ID too
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
    async fetchToken (sessionId) {
      const requestBody = {
        body: this.sessions.results.find(session => session.id === sessionId)
      }
      await fetchApiCall({
        url: 'http://rti-bridge-dev.lco.gtn/login/', method: 'POST', body: requestBody, successCallback: (response) => { this.currentSession.token = response.token }, failCallback: () => { console.error('Failed to authenticate user') }
      })
    }
  }
})
