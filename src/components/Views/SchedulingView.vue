<script setup>
import { computed, ref } from 'vue'
import AdvancedScheduling from '../Scheduling/AdvancedScheduling.vue'
import BeginnerScheduling from '../Scheduling/BeginnerScheduling.vue'
import { fetchApiCall } from '../../utils/api.js'
import DashboardView from './DashboardView.vue'
import { useRouter } from 'vue-router'
import { useConfigurationStore } from '../../stores/configuration.js'
import { createTargetPayload } from '../../utils/payloadForRequestedObservations.js'
import { detect } from 'detect-browser'
import emailjs from '@emailjs/browser'
import { useUserDataStore } from '../../stores/userData.js'

const configurationStore = useConfigurationStore()
const userDataStore = useUserDataStore()

// TO DO (future): Get level depending on course completion
const level = ref('')
const observationData = ref(null)
const showScheduled = ref(false)
const operatorValue = ref('')
const router = useRouter()
const errorMessage = ref('')
// Used to clear error message when going back to previous display
const previousDisplay = ref(null)
const currentDisplay = ref(null)
const isCadenceValid = ref(false)
const cadenceSelection = ref('none')
const isSubmittingBug = ref(false)
const bugError = ref(null)
const bugPayload = ref(null)
const bugDescription = ref('')
const showBugModal = ref(false)
const toastMessage = ref('')
const showToast = ref(false)
const showReportIssueBtn = ref(false)

const showGenerateCadence = computed(() => {
  return observationData.value && observationData.value.isCadenceRequest === true
})

const getProjectName = () => {
  let targetName = ''
  const today = new Date()
  const formattedDate = today.toISOString().split('T')[0]
  if (observationData.value.targets) {
    targetName = observationData.value.targets[0].name || observationData.value.targets[0].simbadResponse.name
  }
  if (!targetName) {
    const ra = observationData.value.targets[0].ra
    const dec = observationData.value.targets[0].dec
    targetName = `${ra}_${dec}`
  }
  return `${targetName}_${formattedDate}`
}

const onSubmit = async () => {
  const targets = observationData.value.targets
  const { startDate, endDate } = observationData.value
  const cadenceObj = observationData.value.cadence ? observationData.value.cadence : null
  let requestList = []
  requestList = targets.map(target => {
    const exposures = target.exposures || observationData.value.settings
    return createTargetPayload(
      target,
      exposures,
      startDate,
      endDate
    )
  })
  if (cadenceObj) {
    requestList = await requestExpansion(requestList, cadenceObj)
  }
  submitRequest(requestList)
}

const requestExpansion = async (payload, cadenceObj) => {
  let expandedRequest = []
  if (cadenceObj) {
    payload[0].cadence = { ...cadenceObj }
    payload[0].windows = []
  }
  const requestUrl = `${configurationStore.observationPortalUrl}requestgroups/cadence/`
  if (observationData.value.targets && observationData.value.targets.length > 1) {
    operatorValue.value = 'MANY'
  } else {
    operatorValue.value = 'SINGLE'
  }
  await fetchApiCall({
    url: requestUrl,
    method: 'POST',
    body: {
    // There are a few different scenarios of what the user might select as a target or targets. The name of the project will be the name of the first target (regardless of how many targets there are) or if there isn't a target name,
    // then it's the first target's RA/Dec. The start date is appended in YYYY-MM-DD format to the end of the name
      'name': getProjectName(),
      'proposal': observationData.value.proposal,
      'ipp_value': 1.0,
      'operator': operatorValue.value,
      'observation_type': 'NORMAL',
      'requests': payload
    },
    successCallback: (data) => {
      expandedRequest = data
    },
    failCallback: () => {
      errorMessage.value = 'Failed to generate cadence requests. Please check your cadence settings.'
    }
  })
  return expandedRequest
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
  showReportIssueBtn.value = false
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
    error: JSON.stringify(bug),
    timestamp: new Date(Date.now()).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC'),
    browser: `Browser name: ${browserInfo.name}, version: ${browserInfo.version}, screen size: ${browserInfo.screen}, time zone:${browserInfo.timezone}`,
    os: `${browserInfo.os}`,
    email: userDataStore.profile.email
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

const submitRequest = async (payload) => {
  if (observationData.value.targets && observationData.value.targets.length > 1) {
    operatorValue.value = 'MANY'
  } else {
    operatorValue.value = 'SINGLE'
  }
  const reqBody = {
    // There are a few different scenarios of what the user might select as a target or targets. The name of the project will be the name of the first target (regardless of how many targets there are) or if there isn't a target name,
    // then it's the first target's RA/Dec. The start date is appended in YYYY-MM-DD format to the end of the name
    'name': getProjectName(),
    'proposal': observationData.value.proposal,
    'ipp_value': 1.0,
    'operator': operatorValue.value,
    'observation_type': 'NORMAL',
    'requests': payload
  }

  await fetchApiCall({
    url: `${configurationStore.observationPortalUrl}requestgroups/`,
    method: 'POST',
    body: observationData.value.cadence ? payload : reqBody,
    successCallback: () => {
      showScheduled.value = true
      router.push('/dashboard')
    },
    failCallback: (error) => {
      showScheduled.value = false
      showReportIssueBtn.value = true
      bugError.value = error
      bugPayload.value = reqBody
      errorMessage.value = error.requests[0].non_field_errors[0] || 'Failed to submit observation request. Please try again.'
    }
  })
}

const handleUserSelections = (data) => {
  observationData.value = data
}

const canSubmit = computed(() => {
  if (level.value === 'advanced' && cadenceSelection.value === 'none') {
    return (
      currentDisplay.value === 5 &&
      observationData.value &&
      observationData.value.targets &&
      observationData.value.targets.every(target => target.exposures.length > 0)
    )
  } else if (level.value === 'advanced' && cadenceSelection.value !== 'none') {
    return (
      currentDisplay.value === 5 &&
      observationData.value &&
      observationData.value.isCadenceRequest === true &&
      isCadenceValid.value === true &&
      observationData.value.targets &&
      observationData.value.targets.every(target => target.exposures.length > 0)
    )
  } else if (level.value === 'beginner') {
    return (
      observationData.value &&
      observationData.value.complete === true &&
      observationData.value.settings.length > 0
    )
  }
  return false
})

// Clears errorMessage if the new display value is less than the previous one (i.e. going back)
const handleDisplay = (display) => {
  currentDisplay.value = display
  if (previousDisplay.value !== null && display < previousDisplay.value) {
    errorMessage.value = ''
  }
  previousDisplay.value = display
}

</script>

<template>
  <section class="section highlight">
  <div class="container">
    <h2>Schedule an Observation</h2>
    <div v-if="!level && !showScheduled" class="level-buttons-wrapper">
      <p>What level are you?</p>
      <v-btn @click="level = 'beginner'" color="indigo" class="level-btns">Beginner</v-btn>
      <v-btn @click="level = 'advanced'" color="indigo" class="level-btns">Advanced</v-btn>
    </div>
  </div>
  </section>
  <section class="section">
    <div class="container">
    <div v-if="level === 'beginner' && !showScheduled">
        <BeginnerScheduling
          @selectionsComplete="handleUserSelections"
          @clearErrorMessage="errorMessage = ''"
        />
    </div>
      <div v-else-if="level === 'advanced' && !showScheduled">
        <AdvancedScheduling
          @selectionsComplete="handleUserSelections"
          @updateDisplay="handleDisplay"
          @cadenceValid="isCadenceValid = $event"
          @cadenceSelection="cadenceSelection = $event"
        />
      </div>
      <div v-if="errorMessage && !showScheduled" class="error-row">
        <p class="error-message">Error: {{ errorMessage }}</p>
        <button
          v-if="showReportIssueBtn"
          class="button is-danger bug-btn"
          @click="showBugModal = true"
        >
          Report an issue
        </button>
      </div>
      <div v-if="showScheduled">
        <DashboardView />
      </div>
    </div>
  </section>
      <footer class="footer">
        <v-btn
          v-if="canSubmit"
          color="indigo"
          class="submit-btn"
          :disabled="level === 'advanced' && showGenerateCadence && cadenceSelection === 'simple-period' && !isCadenceValid"
          @click="onSubmit"
        >
        Submit my request
      </v-btn>
      </footer>
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
              Submit bug report
            </button>
            <button class="button" @click="showBugModal = false">
              Cancel
            </button>
          </footer>
        </div>
      </div>
        <transition name="toast">
          <div v-if="showToast"
            class="bug-toast"
            role="status"
            aria-live="polite"
          >
          {{ toastMessage }}
          </div>
        </transition>
</template>

<style scoped>
.level-buttons-wrapper {
  margin-top: 1em;
  gap: 1em;
}
.level-btns {
  margin: 1em;
}
.submit-btn {
  margin-top: 2.5em;
}
.footer {
  position: fixed;
  left: 25%;
  bottom: 4%;
  width: 100%;
  padding: 1em 0;
  text-align: center;
}
.bug-toast {
  position: fixed;
  transform: translateX(-50%);
  left: 50%;
  bottom: 4.5em;
  max-width: 30%;
  background: rgba(16, 185, 129, 0.98);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(16,16,16,0.18);
  z-index: 1200;
  font-size: 0.95rem;
}
.error-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5em;
  margin-top: 1em;
}
.error-message {
  margin: 0;
}
.bug-btn {
  margin: 0;
}
</style>
