<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AladinSkyMap from '../RealTimeInterface/AladinSkyMap.vue'
import SkyChart from '../RealTimeInterface/CelestialMap/SkyChart.vue'
import SessionImageCapture from '../RealTimeInterface/SessionImageCapture.vue'
import RealTimeGallery from '../RealTimeInterface/RealTimeGallery.vue'

const router = useRouter()
const aladinRef = ref(null)
const ra = ref('')
const dec = ref('')
const targetname = ref('')
const progressBar = ref(0)
const moveTelescope = ref(false)
const captureImages = ref(false)
const renderGallery = ref(false)

const targetNameApiUrl = 'https://simbad2k.lco.global/'

function getRaDecFromTargetName () {
  fetch(`${targetNameApiUrl}${targetname.value}?target_type=sidereal`)
    .then(response => response.json())
    .then(data => {
      ra.value = parseFloat(data.ra_d).toFixed(3)
      dec.value = parseFloat(data.dec_d).toFixed(3)
    }).then(() => {
      goToLocation()
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

function handleProgressUpdate (progress) {
  progressBar.value = progress
  if (progress === 100) {
    router.push('/images')
  }
}

// This function will trigger the goToRaDec method in the AladinSkyMap component
function goToLocation () {
  if (aladinRef.value) {
    aladinRef.value.goToRaDec(ra.value, dec.value)
  } else {
    console.error('AladinSkyMap component not fully loaded or goToRaDec method not exposed')
  }
}

function handleStartCaptureImages (value) {
  captureImages.value = value
}

</script>
<template>
  <div v-if="moveTelescope === false && captureImages === false">
    <div class="columns">
        <div class="column is-two-thirds">
          <SkyChart />
      </div>
      <div class="column">
        <AladinSkyMap ref="aladinRef"/>
        <div class="field is-horizontal">
          <div class="field-label"></div>
          <div class="field-body">
            <div class="field is-expanded">
              <div class="field has-addons">
                <div class="control">
                  <input class="input" type="text" placeholder="e.g. NGC891" v-model="targetname">
                </div>
                <div class="control">
                  <button :disabled="!targetname" @click="getRaDecFromTargetName" class="button blue-bg">
                    Target Look Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input class="input" type="text" v-model="ra" placeholder="Right Ascension" disabled>
              </p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input class="input" type="text" v-model="dec" placeholder="Declination" disabled>
              </p>
            </div>
          </div>
        </div>
        <button :disabled="ra === '' || dec === ''" class="button red-bg" @click="moveTelescope = true">Select target</button>
      </div>
    </div>
  </div>
  <div v-else-if="moveTelescope === true && captureImages === false">
    <SessionImageCapture @update:renderGallery="renderGallery = $event" @startCaptureImages="handleStartCaptureImages" :ra="ra" :dec="dec" :targetname="targetname"/>
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
