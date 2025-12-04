<script setup>
import { computed, ref } from 'vue'
import AdvancedScheduling from '../Scheduling/AdvancedScheduling.vue'
import BeginnerScheduling from '../Scheduling/BeginnerScheduling.vue'
import { fetchApiCall } from '../../utils/api.js'
import DashboardView from './DashboardView.vue'
import { useRouter } from 'vue-router'
import { useConfigurationStore } from '../../stores/configuration.js'
import { createTargetPayload } from '../../utils/payloadForRequestedObservations.js'

const configurationStore = useConfigurationStore()

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
const isSubmitting = ref(false)
const isCadenceValid = ref(false)
const cadenceSelection = ref('none')

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
  isSubmitting.value = true
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
      isSubmitting.value = false
      errorMessage.value = 'Failed to generate cadence requests. Please check your cadence settings.'
    }
  })
  return expandedRequest
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
      isSubmitting.value = false
    },
    failCallback: () => {
      showScheduled.value = false
      isSubmitting.value = false
      errorMessage.value = 'At least one of the targets is not visible during this period'
    }
  })
}

const handleUserSelections = (data) => {
  observationData.value = data
}

const canSubmit = computed(() => {
  if (level.value === 'advanced') {
    return (
      cadenceSelection.value === 'none' &&
      currentDisplay.value === 5 &&
      observationData.value &&
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

const resetView = () => {
  level.value = ''
  observationData.value = null
  showScheduled.value = false
  operatorValue.value = ''
  errorMessage.value = ''
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
        <div v-if="errorMessage && !showScheduled">
          <p class="error-message">Error: {{ errorMessage }}</p>
        </div>
        <button class=" button red-bg restart-btn" @click="resetView">RESTART</button>
        <v-btn v-if="canSubmit" color="indigo" class="submit-btn" @click="onSubmit">Submit my request!</v-btn>
    </div>

      <div v-else-if="level === 'advanced' && !showScheduled">
        <AdvancedScheduling
          @selectionsComplete="handleUserSelections"
          @updateDisplay="handleDisplay"
          @cadenceValid="isCadenceValid = $event"
          @cadenceSelection="cadenceSelection = $event"
        />
        <div v-if="errorMessage && !showScheduled">
          <p class="error-message">Error: {{ errorMessage }}</p>
        </div>
        <button class="button red-bg restart-btn" @click="resetView">RESTART</button>
        <v-btn v-if="canSubmit" color="indigo" class="submit-btn" @click="onSubmit">Submit my request</v-btn>
                <v-btn
          v-if="showGenerateCadence && cadenceSelection === 'simple-period'"
          color="indigo"
          class="cadence-btn submit-btn"
          :disabled="!isCadenceValid"
          @click="onSubmit"
        >
          submit my request
        </v-btn>
      </div>
      <div v-if="showScheduled">
        <DashboardView />
      </div>
    </div>
  </section>
</template>

<style scoped>
.level-buttons-wrapper {
  margin-top: 1em;
  gap: 1em;
}
.level-btns {
  margin: 1em;
}
.restart-btn {
  position: absolute;
  margin-top: 12%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.submit-btn {
  margin-top: 2.5em;
}
</style>
