import { defineStore } from 'pinia'

export const useUserDataStore = defineStore('userData', {
  state () {
    return {
      username: '',
      authToken: '',
      profile: {},
      lastLoginTime: null
    }
  },
  persist: true,
  getters: {
    userIsAuthenticated: (state) => {
      if (state.authToken) return true
      else return false
    }
  }
})
