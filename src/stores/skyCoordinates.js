import { defineStore } from 'pinia'
import { raToDegrees, decToDegrees } from '@/utils/convertRaDec'

export const useSkyCoordinatesStore = defineStore('coordinates', {
  state: () => ({
    ra: null,
    dec: null,
    targetNameEntered: '',
    skyMapConfiguration: {}
  }),
  actions: {
    setCoordinates (ra, dec) {
      this.ra = Number(ra) ? ra : raToDegrees(ra)
      this.dec = Number(dec) ? dec : decToDegrees(dec)
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
