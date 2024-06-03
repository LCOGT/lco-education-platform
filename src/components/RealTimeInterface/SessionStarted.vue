<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
const exposureTime = ref('')
const exposureCount = ref('')
const selectedFilter = ref('')
const progressBar = ref(0)
const moveTelescope = ref(false)
const captureImages = ref(false)
const renderGallery = ref(false)
const status = ref(null)

const bridgeApiUrl = 'http://rti-bridge-dev.lco.gtn/command/go'
const targetNameApiUrl = 'https://simbad2k.lco.global/'
const statusApiUrl = 'http://rti-bridge-dev.lco.gtn/status'

let pollingInterval = null

function handleExposureTimeUpdate (newExposureTime) {
  exposureTime.value = newExposureTime
}

function handleSelectedFilterUpdate (newSelectedFilter) {
  selectedFilter.value = newSelectedFilter
}

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

function commandGo () {
  const requestBody = {
    dec: dec.value,
    expFilter: [selectedFilter.value, selectedFilter.value, selectedFilter.value],
    expTime: [exposureTime.value, exposureTime.value, exposureTime.value],
    name: 'm33',
    ra: ra.value
  }

  fetch(bridgeApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
    .then(response => {
      console.log('this is response', response)
      if (response.ok) {
        console.log('response is ok')
      }
    })
    .catch(error => {
      console.log('error', error)
    })
}

async function fetchStatus () {
  try {
    const response = await fetch(statusApiUrl)
    const data = await response.json()
    status.value = data
  } catch (error) {
    console.error('Error:', error)
  }
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

onMounted(() => {
  fetchStatus()
  pollingInterval = setInterval(fetchStatus, 1000)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
})
</script>
<template>
  <button v-if="ra && dec && exposureTime && selectedFilter" @click="commandGo">Make API Request</button>
  <div v-if="moveTelescope === false && captureImages === false">
    <div class="columns">
        <div class="column is-two-thirds">
          <SkyChart />
      </div>
      <div class="column">
        <AladinSkyMap ref="aladinRef" />
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
        <div class="column">
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Exposure Time</label>
                </div>
                <div class="field-body">
                    <div class="field">
                    <p class="control is-expanded">
                        <input id="exposureTime" type="number" class="input" v-model="exposureTime" placeholder="Seconds">
                    </p>
                    </div>
                </div>
            </div>
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Exposure Count</label>
                </div>
                <div class="field-body">
                    <div class="field">
                    <p class="control is-expanded">
                        <input id="exposureCount" type="number" class="input" v-model="exposureCount">
                    </p>
                    </div>
                </div>
            </div>
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Filter</label>
                </div>
                <div class="field-body">
                    <div class="field is-narrow">
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select id="filter" v-model="selectedFilter">
                                <option disabled value="">Choose a filter</option>
                                <option value="ip">RGB color</option>
                                <option value="rp">Blue</option>
                                <option value="gb">Green (V)</option>
                                <option value="Red">Red</option>
                                <option value="H-Alpha">H-Alpha</option>
                            </select>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
        </div>
        <!-- <button :disabled="ra === '' || dec === ''" @click="goToLocation" class="button blue-bg">Check Visibility</button> -->
        <button :disabled="ra === '' || dec === '' || exposureTime === '' || exposureCount === '' || selectedFilter === ''" class="button red-bg" @click="moveTelescope = true">Go</button>
        <div v-if="status">
        <div v-for="item in status" :key="item">
          <p>Observatory: {{ item.availability }}</p>
          <p>Telescope: {{ item.telescope }}</p>
          <p>Camera: {{ item.instrument }}</p>
          <p>Progress: {{ item.progress }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="moveTelescope === true && captureImages === false">
    <SessionImageCapture @update:renderGallery="renderGallery = $event" @update:exposureTime="handleExposureTimeUpdate" @update:selectedFilter="handleSelectedFilterUpdate"/>
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
