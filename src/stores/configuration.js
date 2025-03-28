import { defineStore } from 'pinia'

export const useConfigurationStore = defineStore('configuration', {
  state () {
    return {
      isConfigLoaded: false,
      observationPortalUrl: '',
      thumbnailArchiveUrl: '',
      rtiBridgeUrl: '',
      targetNameUrl: '',
      datalabUrl: ''
    }
  },
  persist: true
})
