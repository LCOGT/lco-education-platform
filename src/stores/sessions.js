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
    fetchSessions () {
      fetchApiCall({
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
    }
  }
})
