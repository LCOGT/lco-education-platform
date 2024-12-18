<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AladinSkyMap from '../RealTimeInterface/AladinSkyMap.vue'
import SkyChart from '../RealTimeInterface/CelestialMap/SkyChart.vue'
import SessionImageCapture from '../RealTimeInterface/SessionImageCapture.vue'
import { calcAltAz } from '../../utils/visibility.js'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import sites from '../../utils/sites.JSON'
import { fetchApiCall } from '../../utils/api'
import { getFilterList } from '../../utils/populateInstrumentsUtils'
import { useConfigurationStore } from '../../stores/configuration'

const realTimeSessionsStore = useRealTimeSessionsStore()
const configurationStore = useConfigurationStore()

const isCapturingImages = computed(() => {
  if (configurationStore.demo == true) {
    // Change this to true to test the image capture component and false for target select
    return true
  } else {
    return realTimeSessionsStore.isCapturingImagesForCurrentSession
  }
})

const aladinRef = ref(null)
const ra = ref('')
const dec = ref('')
const targetName = ref('')
const exposureTime = ref('')
const exposureCount = ref(1)
const filterList = ref([])
const selectedFilter = ref('')
const fieldOfView = ref(1.0)
const targeterror = ref(false)
const targeterrorMsg = ref('')
const loading = ref(false)
const exposureError = ref('')
const isExposureTimeValid = ref(true)

const currentSession = realTimeSessionsStore.currentSession
const siteInfo = sites[currentSession.site]

function getRaDecFromTargetName () {
  targeterror.value = false
  fetch(configurationStore.targetNameUrl + `${targetName.value}?target_type=sidereal`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        targeterror.value = true
        targeterrorMsg.value = 'Target not found. Enter coordinates or try a different target.'
      } else {
        const lat = siteInfo.lat
        const lon = siteInfo.lon
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

const resetValues = () => {
  realTimeSessionsStore.updateImageCaptureState(true)
  ra.value = ''
  dec.value = ''
  targetName.value = ''
  exposureTime.value = ''
  exposureCount.value = 1
  selectedFilter.value = ''
  fieldOfView.value = 1.0
  loading.value = false
}

const sendGoCommand = async () => {
  loading.value = true
  exposureError.value = ''
  isExposureTimeValid.value = true

  const token = realTimeSessionsStore.getTokenForCurrentSession
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${token}`
  }
  const exposFilter = Array(exposureCount.value).fill(selectedFilter.value)
  const exposTime = Array(exposureCount.value).fill(Number(exposureTime.value))
  const requestBody = {
    dec: Number(dec.value),
    expFilter: exposFilter,
    expTime: exposTime,
    name: targetName.value,
    ra: Number(ra.value) / 15,
    proposalId: realTimeSessionsStore.currentSession.proposal,
    requestGroupId: realTimeSessionsStore.currentSession.request_group_id,
    requestId: realTimeSessionsStore.currentSession.request.id
  }
  if (configurationStore.demo == true) {
    loading.value = false
    resetValues()
    return
  }
  await fetchApiCall({
    url: configurationStore.rtiBridgeUrl + 'command/go',
    method: 'POST',
    body: requestBody,
    header: headers,
    successCallback: resetValues,
    failCallback: (error) => {
      loading.value = false
      if (error?.errors?.expTime) {
        isExposureTimeValid.value = false
        exposureError.value = error.errors.expTime[0]
      } else {
        console.error('API failed with error', error)
      }
    }
  })
}

function updateRenderGallery (value) {
  if (!value) {
    realTimeSessionsStore.updateImageCaptureState(false)
  }
}

const incompleteSelection = computed(() => {
  return exposureTime.value === '' || exposureCount.value === '' || selectedFilter.value === '' || isExposureTimeValid.value === false
})

watch(exposureTime, (newTime) => {
  isExposureTimeValid.value = true
  exposureError.value = ''
})

onMounted(async () => {
  loading.value = false
  filterList.value = await getFilterList()
})

</script>
<template>
  <div v-if="!isCapturingImages">
    <div class="columns">
      <div class="column is-two-thirds">
          <SkyChart />
      </div>
      <div class="column grey-bg">
        <AladinSkyMap ref="aladinRef" />
        <div class="content observe-form">
            <div class="highlight-target-field">
              <div class="field">
                <label class="label">Target Look Up</label>
              </div>
              <div class="field has-addons">
                <div class="control">
                  <input class="input" type="text" placeholder="e.g. NGC891" v-model="targetName">
                </div>
                <div class="control">
                  <button :disabled="!targetName" @click="getRaDecFromTargetName" class="button blue-bg">
                    Search
                  </button>
                </div>
                <p class="help is-danger" v-if="targeterror">{{ targeterrorMsg }}</p>
              </div>
          </div>
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
        <div v-if="ra && dec && !targeterror">
          <div class="columns">
                <div class="column">
                  <p>Mosaic</p>
                </div>
                <div class="column is-one-third">
                    <span class="icon-text mosaic">
                        <input type="radio" name="mosaic" value="1x1" id="1x1" class="hide" checked />
                        <label for="1x1">
                          <span class="icon">
                            <FontAwesomeIcon icon="fa-solid fa-square" @click="changeFov(1.0)" />
                          </span>
                          <span>Single</span>
                        </label>
                    </span>
                </div>
                <div class="column is-one-third">
                    <span class="icon-text mosaic">
                      <input type="radio" name="mosaic" value="2x2" id="2x2" class="hide" />
                      <label for="2x2">
                      <span class="icon">
                        <FontAwesomeIcon icon="fa-solid fa-th-large" @click="changeFov(2.0)"  />
                      </span>
                      <span>2 x 2 mosaic</span>
                      </label>
                    </span>
                </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">Exposure</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input id="exposureTime" type="number" class="input" v-model="exposureTime" placeholder="Seconds">
                  </p>
                  <p class="help is-danger" v-if="!isExposureTimeValid">{{ exposureError }}</p>
                </div>
                <div class="times">
                  <FontAwesomeIcon icon="fa-solid fa-xmark"  />
                </div>
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
                              <option v-for="filter in filterList" :key="filter.code" :value="filter.code">
                                {{ filter.name }}
                              </option>
                            </select>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
              </div>
        </div>
        <button :disabled="incompleteSelection" class="button red-bg" @click="sendGoCommand()">Go</button>
        <v-progress-circular v-if="loading" indeterminate color="white"/>
      </div>
    </div>
  </div>
  <div v-else-if="isCapturingImages">
    <SessionImageCapture @updateRenderGallery="updateRenderGallery" :ra="ra" :dec="dec" :exposure-count="exposureCount" :selected-filter="selectedFilter" :exposure-time="exposureTime" :target-name="targetName" :field-of-view="fieldOfView"/>
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
