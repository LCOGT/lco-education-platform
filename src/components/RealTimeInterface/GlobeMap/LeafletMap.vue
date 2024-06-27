<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { useSessionsStore } from '../../../stores/sessions'
import sites from '../../../utils/sites.JSON'
import availableIcon from '../../../assets/Icons/available_mapmarker.png'
import unavailableIcon from '../../../assets/Icons/unavailable_mapmarker.png'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emits = defineEmits(['siteSelected'])

const sessionsStore = useSessionsStore()

const mapMarkerAvailable = availableIcon
const mapMarkerUnavailable = unavailableIcon

const mapContainer = ref(null)

// Placeholder function to determine availability
const isAvailable = () => Math.random() > 0.5

onMounted(() => {
  const map = L.map(mapContainer.value).setView([0, 0], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  }).addTo(map)

  const customIconAvailable = L.icon({
    iconUrl: mapMarkerAvailable,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  })

  const customIconUnavailable = L.icon({
    iconUrl: mapMarkerUnavailable,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  })

  Object.entries(sites).forEach(([site, { lat, lon }]) => {
    const available = isAvailable()
    const icon = available ? customIconAvailable : customIconUnavailable
    const popupText = available ? `${site}<br>available` : `${site}<br>unavailable`

    const marker = L.marker([lat, lon], { icon })
    marker.bindPopup(popupText)
    marker.on('click', () => {
      if (available) {
        emits('siteSelected', { site, lat, lon })
      }
    })
    marker.addTo(map)
  })
})
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style>
.map-container {
  height: 40vh;
  width: 100%;
}
</style>
