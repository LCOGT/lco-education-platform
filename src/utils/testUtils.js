import { createPinia, setActivePinia, defineStore } from 'pinia'

export function createTestStores () {
  const pinia = createPinia()
  setActivePinia(pinia)

  const useSessionsStore = defineStore('sessions', {
    state: () => ({
      sessions: {
        results: []
      }
    })
  })

  const useUserDataStore = defineStore('userData', {
    state: () => ({
      authToken: 'mock-token'
    })
  })

  const useConfigurationStore = defineStore('configuration', {
    state: () => ({
      thumbnailArchiveUrl: 'http://mock-api.com/'
    })
  })

  return {
    sessionsStore: useSessionsStore(),
    userDataStore: useUserDataStore(),
    configurationStore: useConfigurationStore()
  }
}
