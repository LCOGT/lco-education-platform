import { createPinia, setActivePinia } from 'pinia'
import { useSessionsStore } from '../stores/sessions'
import { useUserDataStore } from '../stores/userData'
import { useConfigurationStore } from '../stores/configuration'

export function createTestStores () {
  const pinia = createPinia()
  setActivePinia(pinia)

  // Create stores and set the necessary state for the tests
  const sessionsStore = useSessionsStore()
  const userDataStore = useUserDataStore()
  const configurationStore = useConfigurationStore()

  // Set the initial state needed for your tests
  userDataStore.authToken = 'mock-token'
  configurationStore.thumbnailArchiveUrl = 'http://mock-api.com/'

  return {
    pinia,
    sessionsStore,
    userDataStore,
    configurationStore
  }
}
