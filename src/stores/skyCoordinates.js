import { defineStore } from 'pinia'

export const useSkyCoordinatesStore = defineStore('coordinates', {
  state: () => ({
    ra: null,
    dec: null,
    targetNameEntered: ''
  }),
  actions: {
    setCoordinates (ra, dec) {
      this.ra = ra
      this.dec = dec
    },
    setTargetNameEntered (value) {
      this.targetNameEntered = value
    }
  }
})
