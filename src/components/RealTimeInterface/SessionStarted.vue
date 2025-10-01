<script setup>
import { ref, computed, onMounted, watch, defineProps } from 'vue'
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
import { useUserDataStore } from '../../stores/userData'
import emailjs from '@emailjs/browser'
import { detect } from 'detect-browser'

const realTimeSessionsStore = useRealTimeSessionsStore()
const configurationStore = useConfigurationStore()
const skyCoordinatesStore = useSkyCoordinatesStore()
const userDataStore = useUserDataStore()

const isCapturingImages = computed(() => {
  if (configurationStore.demo == true) {
    // Change this to true to test the image capture component and false for target select
    return false
  } else {
    return realTimeSessionsStore.isCapturingImagesForCurrentSession
  }
})

const props = defineProps({
  draftMode: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['doneDrafting'])

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
const exposureSettings = ref([])
const bugDescription = ref('')
const showBugModal = ref(false)
const bugError = ref(null)
const bugPayload = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
const isSubmittingBug = ref(false)

const currentSession = realTimeSessionsStore.currentSession
const siteInfo = sites[currentSession.site]

// This has to be computed because when the user deletes, the store updates but the frontend doesn't
// I tested without it being computed
const draftedTargets = computed(() => realTimeSessionsStore.draftedTargets[realTimeSessionsStore.currentSessionId])

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
    validTarget.value = true
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
  realTimeSessionsStore.resetProgress()
  realTimeSessionsStore.fetchObservationParams(exposureSettings.value)
}

function getBrowserInfoSimple () {
  const info = detect() || { name: 'unknown', version: 'unknown', os: 'unknown' }
  return {
    name: info.name,
    version: info.version,
    os: info.os,
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    timezone: (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : ''
  }
}

async function confirmSubmitBug () {
  isSubmittingBug.value = true
  const success = await submitBugReport(bugError.value, bugPayload.value)
  isSubmittingBug.value = false
  showBugModal.value = false
  bugError.value = null
  bugPayload.value = null
  bugDescription.value = ''
  toastMessage.value = success
    ? 'Thanks — your bug report has been submitted. We will look into it.'
    : 'Sorry — we could not send your bug report. Please try again later.'
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3500)
}

async function submitBugReport (bug, payload) {
  const browserInfo = getBrowserInfoSimple()
  const report = {
    description: bugDescription.value,
    payload: JSON.stringify(payload),
    user: userDataStore.username,
    site: JSON.stringify(siteInfo),
    proposal: currentSession.proposal,
    error: JSON.stringify(bug),
    timestamp: new Date(Date.now()).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC'),
    browser: `Browser name: ${browserInfo.name}, version: ${browserInfo.version}, screen size: ${browserInfo.screen}, time zone:${browserInfo.timezone}`,
    os: `${browserInfo.os}`,
    email: userDataStore.profile.email,
    store: JSON.stringify(skyCoordinatesStore.skyMapConfiguration)
  }
  try {
    await emailjs.send(
      'service_ywoge7h',
      'template_f44b2gg',
      report,
      'VpdZaTZpic-pUL4GI'
    )
    return true
  } catch (error) {
    return false
  }
}

const sendGoCommand = async () => {
  if (configurationStore.demo) {
    realTimeSessionsStore.setPreviousThumbnailCount(realTimeSessionsStore.thumbnailCount)
  } else {
    // Getting the absolute total of thumbnails to be able to keep track of progress
    const sessionId = realTimeSessionsStore.currentSession.id
    const url = configurationStore.thumbnailArchiveUrl + `thumbnails/?observation_id=${sessionId}&size=large`
    const response = await fetchApiCall({ url, method: 'GET' })
    const absoluteTotalThumbnails = Array.isArray(response?.results)
      ? response.results.filter(result => result.url && result.url.includes('e01-large_thumbnail')).length
      : 0
    realTimeSessionsStore.setPreviousThumbnailCount(absoluteTotalThumbnails)
  }

  realTimeSessionsStore.resetProgress()

  loading.value = true
  exposureError.value = ''
  isExposureTimeValid.value = true

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
    exposFilter = suggestionOrManual.value === 'suggestions'
      ? selectedFilter.value
      : Array(exposureCount.value).fill(selectedFilter.value)
    exposTime = suggestionOrManual.value === 'suggestions'
      ? exposureTime.value
      : Array(exposureCount.value).fill(Number(exposureTime.value))
  }

  exposureSettings.value = exposTime
  realTimeSessionsStore.exposureCount = exposTime.length

  if (realTimeSessionsStore.exposureCount > 0) {
    realTimeSessionsStore.currentThumbnail = 1
  }

  await realTimeSessionsStore.fetchObservationParams(exposTime.map(Number))

  const requestBody = {
    dec: Number(dec.value),
    expFilter: exposFilter,
    expTime: exposTime,
    name: targetName.value || `${(Number(ra.value).toFixed(4)).toString()}_${(Number(dec.value).toFixed(4)).toString()}`,
    ra: Number(ra.value) / 15,
    proposalId: realTimeSessionsStore.currentSession.proposal,
    requestGroupId: realTimeSessionsStore.currentSession.request_group_id,
    requestId: realTimeSessionsStore.currentSession.request.id,
    observationId: realTimeSessionsStore.currentSession.id
  }

  if (configurationStore.demo === true) {
    loading.value = false
    resetValues()
    return
  }

  const token = realTimeSessionsStore.getTokenForCurrentSession
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${token}`
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
        bugError.value = error
        bugPayload.value = requestBody
        showBugModal.value = true
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

watch(exposureTime, () => {
  isExposureTimeValid.value = true
  exposureError.value = ''
})

const targetNameEntered = computed(() => {
  return skyCoordinatesStore.targetNameEntered
})

watch(targetNameEntered, () => {
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
  // TO DO: fetch telescope status every 5 seconds if it's available. If it's not available, fetch every second.
  // also if not available, render a different view
  //
  await realTimeSessionsStore.fetchTelescopeStatus()
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

function saveTargetDetails () {
  realTimeSessionsStore.addDraftTarget(targetName.value, ra.value, dec.value)
  resetSuggestionSettings()
}

const deleteDraftTarget = (targetName) => {
  realTimeSessionsStore.removeDraftTarget(targetName)
}

function resetSuggestionSettings () {
  suggestionOrManual.value = ''
  suggestionByType.value = ''
  targetsByType.value = []
  suggestionTargetSet.value = false
  validTarget.value = false
}

function populateAladinData (target) {
  ra.value = target.raValue
  dec.value = target.decValue
  targetName.value = target.name
  goToLocation()
  suggestionOrManual.value = 'manual'
  validTarget.value = true
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
        <div v-show="suggestionOrManual === 'manual' || (suggestionTargetSet && !props.draftMode)">
          <AladinSkyMap ref="aladinRef" />
        </div>
        <div v-if="suggestionOrManual === ''">
          <h3 v-if="!props.draftMode">How would you like to select your target?</h3>
          <h3 v-if="props.draftMode">Draft your targets below</h3>
          <p v-if="!props.draftMode">Would you like us to give you some suggestions for what to observe, or do you already know?</p>
          <div class="buttons are-medium">
          <button class="button" @click="setSuggestionsOrManual('suggestions')">Target Suggestions</button>
          <button class="button" @click="setSuggestionsOrManual('manual')">I'll enter the details</button>
          <div v-if="draftedTargets.length" class="mt-4 targets-container">
            <h4 v-if="props.draftMode">your drafted targets</h4>
            <h4 v-if="!props.draftMode">Select from your drafted targets</h4>
            <div class="drafted-targets-list">
            <div v-for="target of draftedTargets" :key="target.id">
              <tr class="draft-target-row">
                <td>
                  <div class="draft-target-actions">
                    <button
                    class="button draft-button"
                    @click="populateAladinData(target)"
                    :disabled="props.draftMode"
                    :class="{ 'unclickable': props.draftMode }"
                    >
                    {{ target.name }}
                  </button>
                    <button class="deleteButton" @click="deleteDraftTarget(target.name)">
                      <font-awesome-icon icon="fa-solid fa-trash-can" class="icon red" />
                    </button>
                  </div>
                </td>
              </tr>
            </div>
            </div>
          </div>
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
          <v-btn @click="resetSuggestionSettings()">go back</v-btn>
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
                    <div class="highlight-small-region" v-if="!props.draftMode">
                      <FontAwesomeIcon icon="fa-regular fa-camera-retro"/> <strong>Exposure settings:</strong>
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
                <input class="input" v-model="ra" placeholder="Right Ascension" @input="validTarget = false" @focus="isRaFocused = true" @blur="onRaBlur">
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
                <input class="input" v-model="dec" placeholder="Declination" @input="validTarget = false" @focus="isDecFocused = true" @blur="onDecBlur" >
              </p>
            </div>
          </div>
        </div>
        <div class="field">
      <button class="button blue-bg" @click="areRaAndDecInSky">Check Coordinates</button>
      <v-btn @click="suggestionOrManual = ''; validTarget = false">go back</v-btn>
    </div>
        <div v-if="ra && dec && !targeterror && validTarget && !props.draftMode">
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
        <div class="buttons are-medium" v-if="suggestionOrManual != '' && !props.draftMode">
          <button :disabled="incompleteSelection" class="button red-bg" @click="sendGoCommand()">Go</button>
          <button class="button" @click="resetSuggestionOrManual">Start Again</button>
        </div>
        <div v-if="props.draftMode && validTarget">
          <v-btn class="help is-danger" @click="saveTargetDetails()">save target</v-btn>
        </div>
        <v-progress-circular v-if="loading" indeterminate color="white"/>
        <v-btn v-if="props.draftMode" class="blue-bg draft-btn" @click="emits('doneDrafting')">Done drafting</v-btn>
      </div>
      <div v-if="showBugModal" class="modal is-active">
        <div class="modal-background" @click="showBugModal = false"></div>
        <div class="modal-card">
          <div v-if="isSubmittingBug" class="modal-spinner-overlay" aria-hidden="true">
      <v-progress-circular indeterminate color="white" />
    </div>
          <header class="modal-card-head">
            <h3 class="modal-card-title">
              Sorry, we cannot process your request.<br>
              If you would like us to look into this, <br>
              please submit a bug report below.<br>
            </h3>
            <button class="delete" @click="showBugModal = false"></button>
          </header>
          <section class="modal-card-body">
            <textarea
              v-model="bugDescription"
              class="textarea"
              rows="4"
              placeholder="Please briefly describe your issue."
            ></textarea>
          </section>
          <footer class="modal-card-foot">
            <button
              class="button is-danger"
              :disabled="!bugDescription"
              @click="confirmSubmitBug"
            >
              Submit Bug Report
            </button>
            <button class="button" @click="showBugModal = false">
              Cancel
            </button>
          </footer>
        </div>
      </div>
        <transition name="toast">
          <div
            v-if="showToast"
            class="bug-toast"
            role="status"
            aria-live="polite"
          >
          {{ toastMessage }}
          </div>
        </transition>
    </div>
  </div>
  <div v-else-if="isCapturingImages">
    <SessionImageCapture @updateRenderGallery="updateRenderGallery" :ra="ra" :dec="dec" :exposure-count="exposureCount" :exposure-time="exposureTime" :exposure-settings="exposureSettings" :selected-filter="selectedFilter" :target-name="targetName" :field-of-view="fieldOfView"/>
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
.bug-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  background: rgba(16, 185, 129, 0.98);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(16,16,16,0.18);
  z-index: 1200;
  font-size: 0.95rem;
}
.modal-card {
  position: relative;
}
.modal-spinner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  z-index: 1100;
  border-radius: 6px;
  pointer-events: all;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.draft-btn {
  margin-bottom: 1em;
  margin-top: 1em;
  align-self: flex-start;
}
.draft-target-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.draft-target-row td {
  padding: 0.5em 0;
}

.targets-container {
  width: 100%;
}

.drafted-targets-list {
  max-height: 45vh;
  overflow-y: scroll;
  margin-bottom: 1em;
  border-radius: 6px;
  background-color: rgb(102, 107, 112);
  padding: 0.5em;
}

.draft-button {
  border: transparent;
}
.unclickable {
  pointer-events: none;
  opacity: 1 !important;
  cursor: default !important;
  border: none;
}
</style>
