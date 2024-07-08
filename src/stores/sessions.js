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
        url: 'http://observation-portal-dev.lco.gtn/api/observations/',
        method: 'GET',
        successCallback: (response) => {
          this.sessions = response
        }
      })
    },
    addSession (session) {
      this.sessions.results ? this.sessions.results.push(session) : this.sessions.results = [session]
      this.currentSessionId = session.id
    },
    prepareStore () {
      this.sessions.results.forEach(session => {
        if (session.date) {
          session.date = new Date(session.date)
        }
      })
    }
  }
})
