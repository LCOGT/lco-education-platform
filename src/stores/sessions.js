import { defineStore } from 'pinia'

export const useSessionsStore = defineStore('sessions', {
  state () {
    return {
      sessions: [],
      currentSessionId: null,
      nextSessionId: 0
    }
  },
  persist: true,
  getters: {
    currentSession (state) {
      return state.sessions.find(session => session.id === state.currentSessionId) || {}
    },
    getAllSessions (state) {
      return state.sessions
    }
  },
  actions: {
    addSession (session) {
      const newSession = { ...session, id: this.nextSessionId }
      this.sessions.push(newSession)
      this.nextSessionId++
      this.currentSessionId = newSession.id
    },
    prepareStore () {
      this.sessions.forEach(session => {
        if (session.date) {
          session.date = new Date(session.date)
        }
      })
    }
  }
})
