import { defineStore } from 'pinia'

export const useSkyCoordinatesStore = defineStore('coordinates', {
  state: () => ({
    ra: null,
    dec: null,
    targetNameEntered: '',
    skyMapConfiguration: {}
  }),
  actions: {
    setCoordinates (ra, dec) {
      this.ra = ra
      this.dec = dec
    },
    setTargetNameEntered (value) {
      this.targetNameEntered = value
    },
    clearCoordinates () {
      this.ra = null
      this.dec = null
      this.targetNameEntered = ''
    },
    setSkyMapConfiguration (config) {
      this.skyMapConfiguration = config
    }
  }
})
