import { defineStore } from 'pinia'

export const useSkyCoordinatesStore = defineStore('coordinates', {
  state: () => ({
    ra: null,
    dec: null
  }),
  actions: {
    setCoordinates (ra, dec) {
      this.ra = ra
      this.dec = dec
    }
  }
})
