<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRealTimeSessionsStore } from '../../../stores/realTimeSessions'
import { useSkyCoordinatesStore } from '../../../stores/skyCoordinates'
import sites from '../../../utils/sites.JSON'
import celestial from 'd3-celestial'
import { calcAltAz } from '@/utils/visibility'

const Celestial = celestial.Celestial ? celestial.Celestial() : celestial
const realTimeSessionsStore = useRealTimeSessionsStore()
const skyCoordinatesStore = useSkyCoordinatesStore()

const lat = ref()
const lng = ref()

function updateLocation () {
  const time = new Date()
  time.setHours(time.getHours())
  // Adjust for timezone so that celestial will display the correct sky map
  time.setTime(time.getTime() + time.getTimezoneOffset() * 60000)
  Celestial.date(time)
  Celestial.location([lat.value, lng.value])
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
    galaxies: {
      show: true
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
      show: true,
      names: true,
      namesType: false,
      nameStyle: {
        fill: '#cccc99',
        align: 'center',
        baseline: 'middle',
        opacity: 0.8,
        font: [
          'bold 11px Helvetica, Arial, sans-serif',
          'bold 11px Helvetica, Arial, sans-serif',
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
  setTimeout(() => {
    renderCrosshairsAtCenter()
  }, 1000)
}

function drawCrosshairs (ctx, x, y) {
  // Crosshair styling in pixels
  const crosshairSize = 10
  ctx.save()
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 2

  // Horizontal line
  ctx.beginPath()
  ctx.moveTo(x - crosshairSize, y)
  ctx.lineTo(x + crosshairSize, y)
  ctx.stroke()

  // Vertical line
  ctx.beginPath()
  ctx.moveTo(x, y - crosshairSize)
  ctx.lineTo(x, y + crosshairSize)
  ctx.stroke()

  // Restore the canvas context
  ctx.restore()
}

// On click event listener for the celestial map
function attachClickListener () {
  const celestialMap = document.getElementById('celestial-map')
  celestialMap.addEventListener('click', (event) => {
    const canvas = celestialMap.querySelector('canvas')
    if (!canvas) {
      console.error('Canvas not found!')
      return
    }

    // Get the bounding rectangle of the canvas so that user can't click outside the canvas
    const rect = canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY)

    // Calculate the click position relative to the canvas
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if the click is inside the circular sky map
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    )
    if (distanceFromCenter > radius) {
      // Ignore clicks outside the circular sky map
      return
    }

    // Convert the pixel coordinates to celestial coordinates
    const coords = Celestial.mapProjection.invert([x, y])
    if (coords) {
      const ra = coords[0]
      const dec = coords[1]
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2)
      Celestial.redraw()
      drawCrosshairs(ctx, ra, dec)
      skyCoordinatesStore.setCoordinates(ra, dec)
      skyCoordinatesStore.setTargetNameEntered('')
    } else {
      console.error('Click is outside the celestial map bounds.')
    }
  })
}

function moveCrosshairsToRaDec (ra, dec) {
  const canvas = document.querySelector('#celestial-map canvas')
  if (!canvas) {
    console.error('Canvas not found!')
    return
  }

  const ctx = canvas.getContext('2d')
  // Clears existing crosshairs
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  Celestial.redraw()

  const pixelCoords = Celestial.mapProjection([ra, dec])

  if (pixelCoords) {
    const [x, y] = pixelCoords

    const isVisible = Celestial.clip([ra, dec])
    if (isVisible) {
      drawCrosshairs(ctx, x, y)
    }
    skyCoordinatesStore.setCoordinates(ra, dec)
  }
}

function renderCrosshairsAtCenter () {
  const canvas = document.querySelector('#celestial-map canvas')
  if (!canvas) {
    console.error('Canvas not found!')
    return
  }

  const ctx = canvas.getContext('2d')

  const { width, height, scale } = Celestial.metrics()

  // The center of the map
  const centerX = width / 2
  const centerY = height / 2

  // Convert the center pixel coordinates to celestial coordinates
  const centerCoords = Celestial.mapProjection.invert([centerX, centerY])

  if (centerCoords) {
    // Draw crosshairs at the center of the sky map
    drawCrosshairs(ctx, centerX, centerY)
  } else {
    console.error('Failed to compute celestial center coordinates.')
  }
}

watch(
  () => [skyCoordinatesStore.ra, skyCoordinatesStore.dec],
  ([ra, dec]) => {
    if (ra !== null && dec !== null) {
      moveCrosshairsToRaDec(ra, dec)
    }
  }
)

onMounted(() => {
  const currentSession = realTimeSessionsStore.currentSession
  if (currentSession && currentSession.site) {
    const siteInfo = sites[currentSession.site]
    if (siteInfo && Celestial) {
      lat.value = siteInfo.lat
      lng.value = siteInfo.lon
      initializeCelestial()
    }
  }
  attachClickListener()
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
