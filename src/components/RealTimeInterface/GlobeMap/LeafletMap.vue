<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref(null)

onMounted(() => {
  const map = L.map(mapContainer.value).setView([0, 0], 2)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  }).addTo(map)
})

</script>

<template>
    <div>
        <div ref="mapContainer" class="map-container"></div>
    </div>
</template>

<style>
.map-container {
    height: 80vh;
    width: 100%;
}
</style>
