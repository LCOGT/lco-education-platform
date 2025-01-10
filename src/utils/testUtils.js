import { createPinia, setActivePinia } from 'pinia'
import { useRealTimeSessionsStore } from '../stores/realTimeSessions'
import { useObsPortalDataStore } from '../stores/obsPortalData'
import { useUserDataStore } from '../stores/userData'
import { useConfigurationStore } from '../stores/configuration'

export function createTestStores () {
  const pinia = createPinia()
  setActivePinia(pinia)

  // Create stores and set the necessary state for the tests
  const realTimeSessionsStore = useRealTimeSessionsStore()
  const obsPortalDataStore = useObsPortalDataStore()
  const userDataStore = useUserDataStore()
  const configurationStore = useConfigurationStore()

  // Set the initial state needed for your tests
  userDataStore.authToken = 'mock-token'
  configurationStore.thumbnailArchiveUrl = 'http://mock-api.com/'
  configurationStore.observationPortalUrl = 'http://mock-api.com/'
  configurationStore.rtiBridgeUrl = 'http://mock-api.com/'
  configurationStore.targetNameUrl = 'http://mock-api.com/'

  return {
    pinia,
    realTimeSessionsStore,
    obsPortalDataStore,
    userDataStore,
    configurationStore
  }
}
