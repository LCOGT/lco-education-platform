<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AladinSkyMap from '../RealTimeInterface/AladinSkyMap.vue'
import SkyChart from '../RealTimeInterface/CelestialMap/SkyChart.vue'
import SessionImageCapture from '../RealTimeInterface/SessionImageCapture.vue'
import RealTimeGallery from '../RealTimeInterface/RealTimeGallery.vue'
import { calcAltAz } from '../../utils/visibility.js'
import { useSessionsStore } from '../../stores/sessions'

const sessionsStore = useSessionsStore()

const router = useRouter()
const aladinRef = ref(null)
const ra = ref('')
const dec = ref('')
const targetName = ref('')
const fieldOfView = ref(1.0)
const progressBar = ref(0)
const moveTelescope = ref(false)
const captureImages = ref(false)
const renderGallery = ref(false)
const targeterror = ref(false)
const targeterrorMsg = ref('')

const targetNameApiUrl = 'https://simbad2k.lco.global/'

function getRaDecFromTargetName () {
  targeterror.value = false
  fetch(`${targetNameApiUrl}${targetName.value}?target_type=sidereal`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        targeterror.value = true
        targeterrorMsg.value = 'Target not found. Enter coordinates or try a different target.'
      } else {
        const lat = sessionsStore.selectedSite.lat
        const lon = sessionsStore.selectedSite.lon
        ra.value = parseFloat(data.ra_d).toFixed(3)
        dec.value = parseFloat(data.dec_d).toFixed(3)
        const vals = calcAltAz(data.ra_d, data.dec_d, lat, lon)
        if (vals[1] < 30.0) {
          targeterror.value = true
          targeterrorMsg.value = 'Target not visible. Try a different target.'
        }
      }
    }).then(() => {
      goToLocation()
    })
    .catch(error => {
      console.error('Error:', error)
      targeterror.value = true
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

function changeFov (fov) {
  if (aladinRef.value && aladinRef.value.setFov) {
    aladinRef.value.setFov(fov)
    fieldOfView.value = fov
  }
}

</script>
<template>
  <div v-if="moveTelescope === false && captureImages === false">
    <div class="columns">
        <div class="column is-two-thirds">
          <SkyChart />
      </div>
      <div class="column grey-bg">
        <AladinSkyMap ref="aladinRef" />
        <div class="mosaic-wrapper">
                <p>Mosaic</p>
                <div class="text-wrapper mosaic">
                    <span class="icon-text">
                        <span class="icon">
                            <FontAwesomeIcon icon="fa-solid fa-square" @click="changeFov(1.0)" />
                        </span>
                        <span>Single</span>
                    </span>
                </div>
                <div class="text-wrapper mosaic">
                    <span class="icon-text">
                    <span class="icon">
                        <FontAwesomeIcon icon="fa-solid fa-th-large" @click="changeFov(2.0)"  />
                    </span>
                    <span>2 x 2 mosaic</span>
                    </span>
                </div>
            </div>
        <div class="content">
          <div class="field has-addons">
              <p class="control is-expanded">
                <input class="input" type="text" placeholder="e.g. NGC891" v-model="targetName">
              </p>
              <p class="control">
                <button :disabled="!targetName" @click="getRaDecFromTargetName" class="button blue-bg">
                    Target Look Up
                  </button>
              </p>
            </div>
            <p class="help is-danger" v-if="targeterror">{{ targeterrorMsg }}</p>
            <div class="field is-horizontal">
          <div class="field-label is-normal">
                    <label class="label">Right Ascension</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input class="input" type="text" v-model="ra" placeholder="Right Ascension" disabled>
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
                <input class="input" type="text" v-model="dec" placeholder="Declination" disabled>
              </p>
            </div>
          </div>
        </div>
        <div v-if="ra && dec">
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
        <PolledThumbnails />
      </div>
    </div>
  </div>
  <div v-else-if="moveTelescope === true && captureImages === false">
    <SessionImageCapture @update:renderGallery="renderGallery = $event" :ra="ra" :dec="dec" :exposure-count="exposureCount" :selected-filter="selectedFilter" :exposure-time="exposureTime" :target-name="targetName" :field-of-view="fieldOfView"/>
  </div>
  <div v-else-if="captureImages === true && progressBar < 100">
    <RealTimeGallery @updateProgress="handleProgressUpdate" />
  </div>
</template>

<style scoped>
p.mosaic {
  cursor: default;
  font-size: 1.5em;
}
.icon {
  cursor: pointer;
}
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
