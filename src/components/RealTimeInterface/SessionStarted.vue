<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AladinSkyMap from '../RealTimeInterface/AladinSkyMap.vue'
import SkyChart from '../RealTimeInterface/CelestialMap/SkyChart.vue'
import SessionImageCapture from '../RealTimeInterface/SessionImageCapture.vue'
import { calcAltAz, calculateVisibleTargets } from '../../utils/visibility.js'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import sites from '../../utils/sites.JSON'
import targets from '../../utils/targets.min.json'
import { fetchApiCall } from '../../utils/api'
import { getFilterList } from '../../utils/populateInstrumentsUtils'
import { useConfigurationStore } from '../../stores/configuration'
import { useSkyCoordinatesStore } from '../../stores/skyCoordinates'

const realTimeSessionsStore = useRealTimeSessionsStore()
const configurationStore = useConfigurationStore()
const skyCoordinatesStore = useSkyCoordinatesStore()

const isCapturingImages = computed(() => {
  if (configurationStore.demo == true) {
    // Change this to true to test the image capture component and false for target select
    return false
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
const targetList = ref({})
const targetsByType = ref([])
const suggestionOrManual = ref('')
const suggestionByType = ref('')
const suggestionTargetSet = ref(false)
const selectedTarget = ref({})
const validTarget = ref(false)
const isRaFocused = ref(false)
const isDecFocused = ref(false)
const maxExposures = ref(3)

const currentSession = realTimeSessionsStore.currentSession
const siteInfo = sites[currentSession.site]

const categories = ref([
  {
    location: 'Deep Space',
    options: [
      { name: 'Galaxy', icon: require('@/assets/Icons/galaxy.png'), shortname: 'galaxies' },
      { name: 'Star Cluster', icon: require('@/assets/Icons/star-cluster.png'), shortname: 'clusters' },
      { name: 'Supernova', icon: require('@/assets/Icons/supernova.png'), shortname: 'supernovae' },
      { name: 'Nebula', icon: require('@/assets/Icons/nebula.png'), shortname: 'nebulae' }
    ]
  }
])

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
        ra.value = parseFloat(data.ra_d).toFixed(5)
        dec.value = parseFloat(data.dec_d).toFixed(5)
        skyCoordinatesStore.setTargetNameEntered(targetName.value)
        const vals = calcAltAz(data.ra_d, data.dec_d, lat, lon)
        if (vals[1] < 30.0) {
          targeterror.value = true
          targeterrorMsg.value = 'Target not visible. Try a different target.'
        } else {
          validTarget.value = true
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

// ask Edward what units this is in
function areRaAndDecInSky () {
  if (ra.value && dec.value) {
    skyCoordinatesStore.setCoordinates(ra.value, dec.value)
    ra.value = parseFloat(ra.value).toFixed(5)
    dec.value = parseFloat(dec.value).toFixed(5)
    const vals = calcAltAz(ra.value, dec.value, siteInfo.lat, siteInfo.lon)
    if (vals[1] < 30.0) {
      targeterror.value = true
      targeterrorMsg.value = 'Target not visible. Try a different target.'
      validTarget.value = false
    } else {
      targeterror.value = false
      targeterrorMsg.value = ''
      validTarget.value = true
      skyCoordinatesStore.setCoordinates(ra.value, dec.value)
    }
    goToLocation()
  }
}

function setRaDecfromTargetList (event) {
  const target = event.target
  const id = target.getAttribute('data-targetid')
  selectedTarget.value = targets[id]
  if (selectedTarget.value) {
    ra.value = parseFloat(selectedTarget.value.ra).toFixed(5)
    dec.value = parseFloat(selectedTarget.value.dec).toFixed(5)
    targetName.value = selectedTarget.value.name
    suggestionTargetSet.value = true
    goToLocation()
    exposureCount.value = 1
    exposureTime.value = Object.values(selectedTarget.value.filters).map(f => f.exposure)
    selectedFilter.value = Object.values(selectedTarget.value.filters).map(f => f.name)
  }
}

// This function will trigger the goToRaDec method in the AladinSkyMap component
function goToLocation () {
  if (aladinRef.value && ra.value && dec.value) {
    aladinRef.value.goToRaDec(ra.value, dec.value)
  } else {
    console.error('AladinSkyMap component not fully loaded or goToRaDec method not exposed')
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
  let exposFilter
  let exposTime
  // Prepare an array of filters for RGB exposures
  if (selectedFilter.value === 'rgb' && suggestionOrManual.value === 'manual') {
    exposFilter = ['rp', 'V', 'B']
    exposTime = [Number(exposureTime.value), Number(exposureTime.value), Number(exposureTime.value)]
  } else {
  // If suggestions mode is selected, then selectedFilter and exposureTime are populated with the values from the selected target
  // If manual mode is selected, then selectedFilter and exposureTime are populated with the values entered by the user
  // The fill method is used to repeat the values for each exposure in the sequence as many times as the value of exposureCount
    exposFilter = suggestionOrManual.value === 'suggestions' ? selectedFilter.value : Array(exposureCount.value).fill(selectedFilter.value)
    exposTime = suggestionOrManual.value === 'suggestions' ? exposureTime.value : Array(exposureCount.value).fill(Number(exposureTime.value))
  }
  const requestBody = {
    dec: Number(dec.value),
    expFilter: exposFilter,
    expTime: exposTime,
    // Name is the target name if entered, else the coordinates in string format
    name: targetName.value || `${(Number(ra.value).toFixed(4)).toString()}_${(Number(dec.value).toFixed(4)).toString()}`,
    ra: Number(ra.value) / 15,
    proposalId: realTimeSessionsStore.currentSession.proposal,
    requestGroupId: realTimeSessionsStore.currentSession.request_group_id,
    requestId: realTimeSessionsStore.currentSession.request.id,
    observationId: realTimeSessionsStore.currentSession.id
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

function setSuggestionsOrManual (mode) {
  suggestionOrManual.value = mode
}

function resetSuggestionOrManual () {
  suggestionOrManual.value = ''
  suggestionByType.value = ''
  targetsByType.value = []
  suggestionTargetSet.value = false
  exposureError.value = ''
  isExposureTimeValid.value = true
}

function updateRenderGallery (value) {
  if (!value) {
    realTimeSessionsStore.updateImageCaptureState(false)
  }
}

function getVisibleTargets () {
  targetList.value = calculateVisibleTargets(targets, siteInfo.lat, siteInfo.lon)
}

function setSuggestionType (type) {
  suggestionByType.value = type
  if (Object.keys(targetList.value).length === 0) {
    getVisibleTargets()
    targetsByType.value = targetList.value[type]
    targetsByType.value = targetsByType.value.sort(() => 0.5 - Math.random()).slice(0, 5)
  } else {
    targetsByType.value = targetList.value[type]
    targetsByType.value = targetsByType.value.sort(() => 0.5 - Math.random()).slice(0, 5)
  }
}

const incompleteSelection = computed(() => {
  return exposureTime.value === '' || exposureCount.value === '' || selectedFilter.value === '' || isExposureTimeValid.value === false
})

watch(exposureTime, (newTime) => {
  isExposureTimeValid.value = true
  exposureError.value = ''
})

const targetNameEntered = computed(() => {
  return skyCoordinatesStore.targetNameEntered
})

watch(targetNameEntered, (newValue, oldValue) => {
  if (targetNameEntered.value === '') {
    targeterror.value = false
    targeterrorMsg.value = ''
    targetName.value = ''
  }
})

onMounted(async () => {
  loading.value = false
  filterList.value = await getFilterList()
  // Adds rgb to the top of the filter list
  filterList.value.unshift({ name: 'RGB', code: 'rgb' })
  getVisibleTargets()
  skyCoordinatesStore.clearCoordinates()
})

function handleUpdateCoordinates ({ ra: newRa, dec: newDec }) {
  ra.value = parseFloat(newRa).toFixed(5)
  dec.value = parseFloat(newDec).toFixed(5)
}

function updateCoordinatesStore () {
  if (ra.value && dec.value) {
    const parsedRa = parseFloat(ra.value).toFixed(5)
    const parsedDec = parseFloat(dec.value).toFixed(5)
    ra.value = parsedRa
    dec.value = parsedDec
    skyCoordinatesStore.setCoordinates(parsedRa, parsedDec)
  }
}

function onRaBlur () {
  isRaFocused.value = false
  updateCoordinatesStore()
}

function onDecBlur () {
  isDecFocused.value = false
  updateCoordinatesStore()
}

watch(
  () => selectedFilter.value,
  (newFilter) => {
    if (newFilter === 'rgb') {
      maxExposures.value = 1
      exposureCount.value = 1
    } else {
      maxExposures.value = 3
    }
  }
)

// Watch for changes in the store and update local values only if the input is not being edited.
watch(
  () => skyCoordinatesStore.ra,
  (newRa) => {
    if (!isRaFocused.value && newRa !== null) {
      ra.value = parseFloat(newRa).toFixed(5)
    }
  }
)

watch(
  () => skyCoordinatesStore.dec,
  (newDec) => {
    if (!isDecFocused.value && newDec !== null) {
      dec.value = parseFloat(newDec).toFixed(5)
    }
  }
)
</script>

<template>
  <div v-if="!isCapturingImages">
    <div class="columns">
      <div class="column is-two-thirds">
          <SkyChart :ra="ra" :dec="dec" @update-coordinates="handleUpdateCoordinates" />
      </div>
      <div class="column grey-bg">
        <div v-show="suggestionOrManual === 'manual' || suggestionTargetSet">
        <AladinSkyMap ref="aladinRef" />
        </div>
        <div v-if="suggestionOrManual === ''">
          <h3>How would you like to select your target?</h3>
          <p>Would you like us to give you some suggestions for what to observe, or do you already know?</p>
          <div class="buttons are-medium">
          <button class="button" @click="setSuggestionsOrManual('suggestions')">Target Suggestions</button>
          <button class="button" @click="setSuggestionsOrManual('manual')">I'll enter the details</button>
        </div>
        </div>
        <div v-if="suggestionOrManual === 'suggestions' && targetsByType.length === 0">
          <h3>What would you like to Explore?</h3>
          <p>Choose a type of target to see suggestions</p>
          <div v-for="category in categories" :key="category.location" class="content">
          <h4>{{ category.location }}</h4>
          <div class="buttons">
            <a
              v-for="option in category.options"
              :key="option.shortname"
              @click="setSuggestionType(option.shortname)"
              class="button suggestion"
            >
            <span>
              <img :src=option.icon alt='icon' />
            </span>
            <span>{{ option.name }}</span>
          </a>
          </div>
        </div>
        </div>
        <div v-if="suggestionOrManual === 'suggestions' && targetsByType.length > 0">
          <div v-if="!suggestionTargetSet">
            <h3>Target Suggestions</h3>
            <p>Here are a random selection of 5 <strong>{{ suggestionByType }}</strong> from our list.</p>
            <table class="table is-fullwidth">
                <tr v-for="target in targetsByType" :key="target['name']">
                  <td>
                    <button class="link" @click="setRaDecfromTargetList" :data-targetid="target.id">
                      {{ target.name }}
                    </button>
                    </td>
                </tr>
              </table>
            </div>
            <div v-if="suggestionTargetSet">
                <div>
                  <h3>{{ selectedTarget.name }}</h3>
                  <p><strong>Type:</strong> {{ selectedTarget.avmdesc }}</p>
                  <p>{{  selectedTarget.desc }}</p>
                    <div class="highlight-small-region">
                      <FontAwesomeIcon icon="fa-regular fa-camera-retro"  /> <strong>Exposure settings:</strong>
                      <ul v-for="(filter, index) in selectedTarget.filters" :key="index">
                        <li>{{ filter.name }} filter for {{ filter.exposure }} seconds</li>
                      </ul>
                    </div>
                  </div>
            </div>
          </div>
        <div class="content observe-form mt-2" v-if="suggestionOrManual === 'manual'">
          <h3>Enter Target Details</h3>
          <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label">Target</label>
            </div>
            <div class="field-body">
              <div class="field has-addons">
                  <div class="control">
                    <input class="input" type="text" placeholder="e.g. NGC891" v-model="targetName">
                  </div>
                  <div class="control">
                    <button :disabled="!targetName" @click="getRaDecFromTargetName" class="button blue-bg">
                      Find coordinates
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p class="red-bg has-text-centered" v-if="targeterror">{{ targeterrorMsg }}</p>

          <div class="field is-horizontal">
          <div class="field-label is-normal">
              <label class="label">Right Ascension</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input class="input" type="number" v-model="ra" placeholder="Right Ascension" @input="validTarget = false" @focus="isRaFocused = true" @blur="onRaBlur">
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
                <input class="input" type="number" v-model="dec" placeholder="Declination" @input="validTarget = false" @focus="isDecFocused = true" @blur="onDecBlur" >
              </p>
            </div>
          </div>
        </div>
        <div class="field">
      <button class="button blue-bg" @click="areRaAndDecInSky">Check Coordinates</button>
    </div>
        <div v-if="ra && dec && !targeterror && validTarget">
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
                    <input id="exposureCount" type="number" class="input" v-model="exposureCount" :max="maxExposures" min="1">
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="help is-danger" v-if="!isExposureTimeValid">{{ exposureError }}</p>
        <div class="buttons are-medium" v-if="suggestionOrManual != ''">
          <button :disabled="incompleteSelection" class="button red-bg" @click="sendGoCommand()">Go</button>
          <button class="button" @click="resetSuggestionOrManual">Start Again</button>
        </div>
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
