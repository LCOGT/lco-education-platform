<script setup>
import { onMounted, ref } from 'vue'
import AladinSkyMap from '../RealTimeInterface/AladinSkyMap.vue'
import SkyChart from '../RealTimeInterface/CelestialMap/SkyChart.vue'

const timeRemaining = ref(20)
const aladinRef = ref(null)
const ra = ref('')
const dec = ref('')

let timeRemainingInterval
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
  <div>
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
  </div>
</template>

<style scoped>
.sky-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
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

</style>
