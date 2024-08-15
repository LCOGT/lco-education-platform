<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSessionsStore } from '../../../stores/sessions'
import sites from '../../../utils/sites.JSON'
import celestial from 'd3-celestial'

const Celestial = celestial.Celestial ? celestial.Celestial() : celestial
const sessionsStore = useSessionsStore()

const lat = ref(35)
const lng = ref(-105)
const hours_offset = ref(0)

function updateLocation () {
  const time = new Date()
  time.setHours(time.getHours() + hours_offset.value)

  Celestial.date(time)
  Celestial.location([lat, lng])
  Celestial.resize({ width: 0 })
}

function initializeCelestial () {
  const config = {
    width: 600,
    projection: 'stereographic',
    transform: 'equatorial',
    controls: false,
    orientationfixed: true,
    follow: 'zenith',
    disableAnimations: true,
    adaptable: false, // Sizes are increased with higher zoom-levels
    datapath: '/data',
    interactive: false, // Enable zooming and rotation with mousewheel and dragging
    stars: {
      show: true,
      size: 3,
      limit: 6,
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
      symbolType: 'disk',
      symbols: {
        sol: { symbol: '\u2609', letter: 'Su', fill: '#ffff00', size: '24' },
        mer: { symbol: '\u263f', letter: 'Me', fill: '#cccccc' },
        ven: { symbol: '\u2640', letter: 'V', fill: '#eeeecc' },
        ter: { symbol: '\u2295', letter: 'T', fill: '#00ccff' },
        lun: { symbol: '\u25cf', letter: 'L', fill: '#ffffff', size: '24' },
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
    },
    constellations: {
      show: false,
      names: false,
      namesType: false,
      nameStyle: {
        fill: '#cccc99',
        align: 'center',
        baseline: 'middle',
        opacity: 0.8,
        font: [
          'bold 14px Helvetica, Arial, sans-serif',
          'bold 12px Helvetica, Arial, sans-serif',
          'bold 11px Helvetica, Arial, sans-serif'
        ]
      },
      lines: false,
      lineStyle: { stroke: '#cccccc', width: 1, opacity: 0.6 },
      bounds: false,
      boundStyle: { stroke: '#cccc00', width: 0.5, opacity: 0.8, dash: [2, 4] }
    },
    mw: {
      show: true, // Show Milky Way as filled polygons
      style: { fill: '#fef9e7', opacity: 0.10 }
    },
    lines: {
      graticule: {
        show: true,
        stroke: '#cccccc',
        width: 0.3,
        opacity: 0.4, // Show graticule lines
        // grid values: "outline", "center", or [lat,...] specific position
        lon: { pos: 'center', opacity: 0.6, fill: 'lightblue', font: '12px Helvetica, Arial, sans-serif' },
        // grid values: "outline", "center", or [lon,...] specific position
        lat: { pos: 'center', opacity: 0.5, fill: 'lightblue', font: '12px Helvetica, Arial, sans-serif' }
      },
      equatorial: { show: true, stroke: '#aaaaaa', width: 1.3, opacity: 0.4 }, // Show equatorial plane
      ecliptic: { show: true, stroke: '#66cc66', width: 1.3, opacity: 0.3 }, // Show ecliptic plane
      galactic: { show: false, stroke: '#cc6666', width: 1.3, opacity: 0.7 }, // Show galactic plane
      supergalactic: { show: false, stroke: '#cc66cc', width: 1.3, opacity: 0.7 } // Show supergalactic plane
      // mars: { show: false, stroke:"#cc0000", width:1.3, opacity:.7 }
    },
    horizon: { // Show horizon marker, if geo-position and date-time is set
      show: false,
      stroke: '#000099', // Line
      width: 1.0,
      fill: '#000000', // Area below horizon
      opacity: 0.5
    },
    daylight: { // Show daylight marker
      show: false,
      fill: '#f00',
      opacity: 0.1
    }
  }
  Celestial.display(config)
  updateLocation()
}

onMounted(() => {
  const currentSession = sessionsStore.currentSession
  if (currentSession && currentSession.site) {
    const siteInfo = sites[currentSession.site]
    if (siteInfo && Celestial) {
      lat.value = siteInfo.lat
      lng.value = siteInfo.lon
      initializeCelestial()
    }
  }
})

</script>

<template>
  <div id="celestial-map"></div>
</template>

<style scoped>
#celestial-map {
  width: 100%;
  height: 31.25em;
}
</style>
