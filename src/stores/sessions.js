import { defineStore } from 'pinia'

export const useSessionsStore = defineStore('sessions', {
  state () {
    return {
      sessions: [],
      currentSessionId: null,
      nextSessionId: 1
    }
  },
  getters: {
    currentSession (state) {
      return state.sessions.find(session => session.id === state.currentSessionId) || {}
    }
  },
  actions: {
    addSession (session) {
      const newSession = { ...session, id: this.nextSessionId }
      this.sessions.push(newSession)
      this.nextSessionId++
      this.currentSessionId = newSession.id
    }
  }
})
