<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AladinSkyMap from '../RealTimeInterface/AladinSkyMap.vue'
import SkyChart from '../RealTimeInterface/CelestialMap/SkyChart.vue'
import SessionImageCapture from '../RealTimeInterface/SessionImageCapture.vue'
import RealTimeGallery from '../RealTimeInterface/RealTimeGallery.vue'
import ImagesView from '../Views/ImagesView.vue'

const router = useRouter()
const aladinRef = ref(null)
// TO DO: Save these values in the store
const ra = ref('')
const dec = ref('')

const progressBar = ref(0)

function handleProgressUpdate (progress) {
  progressBar.value = progress
  if (progress === 100) {
    router.push('/images')
  }
}

const moveTelescope = ref(false)
const captureImages = ref(false)

const renderGallery = ref(false)

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
  <div v-if="moveTelescope === false && captureImages === false">
    <div class="columns">
        <div class="column is-half">
          <SkyChart />
      </div>
      <div class="column is-half">
        <AladinSkyMap ref="aladinRef" />

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Right Ascension</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input class="input" type="text" v-model="ra" placeholder="e.g. 12:01:23">
              </p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Declination</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input class="input" type="text" v-model="dec" placeholder="-23:45:01">
              </p>
            </div>
          </div>
        </div>
        <button @click="goToLocation" class="button blue-bg">Search</button>
      </div>
    </div>
    <v-btn :disabled="ra === '' || dec === ''" class="red-bg" @click="moveTelescope = true">MOVE TELESCOPE</v-btn>

  </div>
  <div v-else-if="moveTelescope === true && captureImages === false">
    <SessionImageCapture @update:renderGallery="renderGallery = $event"/>
    <v-btn class="go-button" color="indigo" @click="captureImages = true" :disabled="!renderGallery" >GO</v-btn>
  </div>
  <div v-else-if="captureImages === true && progressBar < 100">
    <RealTimeGallery @updateProgress="handleProgressUpdate" />
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
.go-button {
  margin-top: 1.25em;
}
@media (max-width: 900px) {
  .maps-container {
    display: flex;
    flex-direction: column;
  }
}
</style>
