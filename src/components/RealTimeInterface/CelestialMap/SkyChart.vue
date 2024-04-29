<script setup>
import { ref, onMounted } from 'vue'
import celestial from 'd3-celestial'

const Celestial = celestial.Celestial ? celestial.Celestial() : celestial

const lat = ref(35)
const lng = ref(-105)
const hours_offset = ref(0)
const timezone = 'America/Denver'

function getOffset (timeZone = 'UTC', date = new Date()) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone }))
  return (tzDate - utcDate) / 60000
}

function now () {
  Celestial.date(new Date())
}

function updateLocation () {
  const time = new Date()
  time.setHours(time.getHours() + hours_offset.value)

  Celestial.date(time)
  Celestial.location([lat.value, lng.value])
}

onMounted(() => {
  const config = {
    width: 500,
    projection: 'stereographic', // Map projection used: airy, aitoff, armadillo, august, azimuthalEqualArea, azimuthalEquidistant, baker, berghaus, boggs, bonne, bromley, collignon, craig, craster, cylindricalEqualArea, cylindricalStereographic, eckert1, eckert2, eckert3, eckert4, eckert5, eckert6, eisenlohr, equirectangular, fahey, foucaut, ginzburg4, ginzburg5, ginzburg6, ginzburg8, ginzburg9, gringorten, hammer, hatano, healpix, hill, homolosine, kavrayskiy7, lagrange, larrivee, laskowski, loximuthal, mercator, miller, mollweide, mtFlatPolarParabolic, mtFlatPolarQuartic, mtFlatPolarSinusoidal, naturalEarth, nellHammer, orthographic, patterson, polyconic, rectangularPolyconic, robinson, sinusoidal, stereographic, times, twoPointEquidistant, vanDerGrinten, vanDerGrinten2, vanDerGrinten3, vanDerGrinten4, wagner4, wagner6, wagner7, wiechel, winkel3
    transform: 'equatorial', // Coordinate transformation: equatorial (default), ecliptic, galactic, supergalactic
    controls: false, // zoom controls

    // geopos: [this.lat, this.lng],
    orientationfixed: true,
    follow: 'zenith',
    disableAnimations: true,

    stars: {
      show: true,
      size: 6,
      designation: false,
      propername: false,
      data: 'stars.6.json'
    },
    dsos: {
      show: false,
      size: 6,
      designation: false,
      propername: false,
      data: 'dsos.6.json'
    },
    planets: {
      show: true,
      which: [
        'sol',
        'mer',
        'ven',
        'ter',
        'lun',
        'mar',
        'jup',
        'sat',
        'ura',
        'nep'
      ],
      // Font styles for planetary symbols
      symbolType: 'disk',
      symbols: {
        // Character and color for each symbol in 'which', simple circle \u25cf
        sol: { symbol: '\u2609', letter: 'Su', fill: '#ffff00', size: '24' },
        mer: { symbol: '\u263f', letter: 'Me', fill: '#cccccc' },
        ven: { symbol: '\u2640', letter: 'V', fill: '#eeeecc' },
        ter: { symbol: '\u2295', letter: 'T', fill: '#00ccff' },
        lun: { symbol: '\u25cf', letter: 'L', fill: '#ffffff', size: '24' }, // overridden by generated crecent, except letter & size
        mar: { symbol: '\u2642', letter: 'Ma', fill: '#ff6600' },
        cer: { symbol: '\u26b3', letter: 'C', fill: '#cccccc' },
        ves: { symbol: '\u26b6', letter: 'Ma', fill: '#cccccc' },
        jup: { symbol: '\u2643', letter: 'J', fill: '#ffaa33' },
        sat: { symbol: '\u2644', letter: 'Sa', fill: '#ffdd66' },
        ura: { symbol: '\u2645', letter: 'U', fill: '#66ccff' },
        nep: { symbol: '\u2646', letter: 'N', fill: '#6666ff' },
        plu: { symbol: '\u2647', letter: 'P', fill: '#aaaaaa' },
        eri: { symbol: '\u26aa', letter: 'E', fill: '#eeeeee' }
      },
      names: true,
      nameStyle: {
        fill: '#cccccc',
        font: "17px 'Lucida Sans Unicode', 'DejaVu Sans'",
        align: 'right',
        baseline: 'top'
      },
      namesType: 'desig'
    }
  }

  Celestial.display(config)
  updateLocation()
})
</script>

<template>
    <div id="celestial-map"></div>
    <input label="lng" type="number" v-model.number="lng" />
    <input label="lat" type="number" v-model.number="lat" />
    <input label="+ hours" type="number" v-model.number="hours_offset" />
    <button @click="updateLocation">go</button>
    <button @click="now">now</button>
    <div>{{ [lat, lng] }}</div>
    <div>{{ getOffset(timezone) }}</div>
  </template>

<style scoped>
  #celestial-map {
    width: 100%;
    height: 500px;
  }
</style>
