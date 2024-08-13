<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AladinSkyMap from '../RealTimeInterface/AladinSkyMap.vue'
import SkyChart from '../RealTimeInterface/CelestialMap/SkyChart.vue'
import SessionImageCapture from '../RealTimeInterface/SessionImageCapture.vue'
import RealTimeGallery from '../RealTimeInterface/RealTimeGallery.vue'
import { calcAltAz } from '../../utils/visibility.js'
import { useSessionsStore } from '../../stores/sessions'
import sites from '../../utils/sites.JSON'
import celestial from 'd3-celestial'
import { fetchApiCall } from '../../utils/api'
import { useConfigurationStore } from '../../stores/configuration'

const sessionsStore = useSessionsStore()
const configurationStore = useConfigurationStore()

const router = useRouter()
const aladinRef = ref(null)
const ra = ref('')
const dec = ref('')
const targetName = ref('')
// highlight what's selected
const exposureTime = ref('')
const exposureCount = ref(1)
const selectedFilter = ref('')
const fieldOfView = ref(1.0)
const progressBar = ref(0)
const moveTelescope = ref(false)
const captureImages = ref(false)
const renderGallery = ref(false)
const targeterror = ref(false)
const targeterrorMsg = ref('')
const loading = ref(false)

const Celestial = celestial.Celestial()
const currentSession = sessionsStore.currentSession
const siteInfo = sites[currentSession.site]

onMounted(() => {
  if (siteInfo) {
    Celestial.location([siteInfo.lat, siteInfo.lon])
  }

  const startDate = new Date(currentSession.start)
  Celestial.date(startDate)
  Celestial.resize({ width: 0 })
})

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

const sendGoCommand = async () => {
  loading.value = true
  const token = sessionsStore.getTokenForCurrentSession
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${token}`
  }
  const requestBody = {
    dec: Number(dec.value),
    // talk to Matt about this and populate based on choices
    expFilter: ['V', 'ip', 'gp'],
    expTime: [15, 0, 0],
    name: targetName.value,
    ra: Number(ra.value) / 15,
    proposalId: sessionsStore.currentSession.proposal,
    requestGroupId: sessionsStore.currentSession.request_group_id,
    requestId: sessionsStore.currentSession.request.id
  }
  await fetchApiCall({
    url: configurationStore.rtiBridgeUrl + 'command/go',
    method: 'POST',
    body: requestBody,
    header: headers,
    successCallback: () => {
      moveTelescope.value = true
      loading.value = false
    },
    failCallback: (error) => { console.error('API failed with error', error) }
  })
}

function updateRenderGallery (value) {
  renderGallery.value = value
  if (!value) {
    moveTelescope.value = false
    captureImages.value = false
  }
}

const incompleteSelection = computed(() => {
  return exposureTime.value === '' || exposureCount.value === '' || selectedFilter.value === ''
})

</script>
<template>
  <div v-if="moveTelescope === false && captureImages === false">
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
        <!--return to computed prop-->
        <button :disabled="incompleteSelection" class="button red-bg" @click="sendGoCommand()">Go</button>
        <v-progress-circular v-if="loading" indeterminate color="white"/>
      </div>
    </div>
  </div>
  <div v-else-if="moveTelescope === true && captureImages === false">
    <SessionImageCapture  @updateRenderGallery="updateRenderGallery" :ra="ra" :dec="dec" :exposure-count="exposureCount" :selected-filter="selectedFilter" :exposure-time="exposureTime" :target-name="targetName" :field-of-view="fieldOfView"/>
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
