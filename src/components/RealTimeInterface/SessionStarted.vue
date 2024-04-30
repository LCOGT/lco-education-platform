<script setup>
import { onMounted, ref } from 'vue'
import AladinSkyMap from '../RealTimeInterface/AladinSkyMap.vue'
import SkyChart from '../RealTimeInterface/CelestialMap/SkyChart.vue'
import SessionImageCapture from '../RealTimeInterface/SessionImageCapture.vue'

const timeRemaining = ref(20)
const aladinRef = ref(null)
const ra = ref('')
const dec = ref('')

let timeRemainingInterval

const moveTelescope = ref(false)

onMounted(() => {
  timeRemainingInterval = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value === 0) {
      clearInterval(timeRemainingInterval)
    }
  }, 1000)
})

// This function will trigger the goToRaDec method in the AladinSkyMap component
function goToLocation () {
  if (aladinRef.value && aladinRef.value.goToRaDec) {
    aladinRef.value.goToRaDec(ra.value, dec.value)
  } else {
    console.error('AladinSkyMap component not fully loaded or goToRaDec method not exposed')
  }
}
</script>
<template>
  <div v-if="moveTelescope === false">
    <h2>Real Time Session</h2>
    <p>You are controlling Eltham College telescope 1 in Australia</p>
    <p>Time Remaining in session: {{ timeRemaining }}</p>
    <div class="sky-wrapper">
      <div class="maps-container">
        <SkyChart />
        <AladinSkyMap ref="aladinRef" />
      </div>
      <div class="controls-container">
        <input type="text" v-model="ra" placeholder="RA">
        <input type="text" v-model="dec" placeholder="DEC">
        <button @click="goToLocation">GO</button>
      </div>
    </div>
    <v-btn color="indigo" @click="moveTelescope = true">MOVE TELESCOPE</v-btn>
  </div>
  <div v-else-if="moveTelescope === true">
    <SessionImageCapture />
  </div>
</template>

<style scoped>
.sky-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.maps-container {
  display: flex;
  justify-content: space-around;
  align-items: stretch;
}
.controls-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25em;
}
@media (max-width: 900px) {
  .maps-container {
    display: flex;
    flex-direction: column;
  }
}
</style>
