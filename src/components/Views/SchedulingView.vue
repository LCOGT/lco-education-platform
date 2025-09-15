<script setup>
import { computed, ref } from 'vue'
import AdvancedScheduling from '../Scheduling/AdvancedScheduling.vue'
import BeginnerScheduling from '../Scheduling/BeginnerScheduling.vue'
import { fetchApiCall } from '../../utils/api.js'
import DashboardView from './DashboardView.vue'
import { useRouter } from 'vue-router'
import { useConfigurationStore } from '../../stores/configuration.js'
import { createTargetPayloadForNonSiderealRequest, createPayloadForSiderealRequests } from '../../utils/payloadForRequestedObservations.js'

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

const getProjectName = () => {
  let targetName = ''
  const today = new Date()
  const formattedDate = today.toISOString().split('T')[0]
  if (observationData.value.target) {
    targetName = observationData.value.target.name || ''
  } else if (observationData.value.targets && observationData.value.targets.length) {
    targetName = observationData.value.targets[0].name || ''
  }
  if (!targetName) {
    const ra = observationData.value.target
      ? observationData.value.target.ra
      : observationData.value.targets[0].ra
    const dec = observationData.value.target
      ? observationData.value.target.dec
      : observationData.value.targets[0].dec
    targetName = `${ra}_${dec}`
  }
  return `${targetName}_${formattedDate}`
}

const sendObservationRequest = async () => {
  if (observationData.value) {
    const requestList = []

    if (observationData.value.objectType === 'nonsidereal') {
      const { targets, startDate, endDate } = observationData.value
      requestList.push(...targets.map(target => {
        const schemeRequest = target.simbadResponse.mean_daily_motion ? 'JPL_MAJOR_PLANET' : 'MPC_MINOR_PLANET'
        return createTargetPayloadForNonSiderealRequest(target.simbadResponse, schemeRequest, target.exposures, startDate, endDate)
      }))
    }
    else if (observationData.value.objectType === 'sidereal') {
      const { targets, startDate, endDate } = observationData.value
      requestList.push(...targets.map(target =>
        createPayloadForSiderealRequests(target, target.exposures, startDate, endDate)
      ))
      isSubmitting.value = true
    } else if (observationData.value.isSidereal === false) {
      const { target, scheme, settings, startDate, endDate } = observationData.value
      requestList.push(
        createTargetPayloadForNonSiderealRequest(target, scheme, settings, startDate, endDate)
      )
      isSubmitting.value = true
    } else if (observationData.value.target && observationData.value.isSidereal) {
      const { target, settings, startDate, endDate } = observationData.value
      requestList.push(createPayloadForSiderealRequests(target, settings, startDate, endDate))
      isSubmitting.value = true
    }

    if (observationData.value.targets && observationData.value.targets.length > 1) {
      operatorValue.value = 'MANY'
    } else {
      operatorValue.value = 'SINGLE'
    }

    await fetchApiCall({
      url: `${configurationStore.observationPortalUrl}requestgroups/`,
      method: 'POST',
      body: {
        // There are a few different scenarios of what the user might select as a target or targets. The name of the project will be the name of the first target (regardless of how many targets there are) or if there isn't a target name,
        // then it's the first target's RA/Dec. The start date is appended in YYYY-MM-DD format to the end of the name
        'name': getProjectName(),
        'proposal': observationData.value.proposal,
        'ipp_value': 1.0,
        'operator': operatorValue.value,
        'observation_type': 'NORMAL',
        'requests': requestList
      },
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
}

const handleUserSelections = (data) => {
  observationData.value = data
}

const canSubmit = computed(() => {
  if (level.value === 'advanced') {
    return (
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
        <v-btn color="indigo" @click="resetView"> Restart</v-btn>
        <v-btn v-if="canSubmit" color="indigo" @click="sendObservationRequest">Submit my request!</v-btn>
    </div>

      <div v-else-if="level === 'advanced' && !showScheduled">
        <AdvancedScheduling
          @selectionsComplete="handleUserSelections"
          @updateDisplay="handleDisplay"
        />
        <div v-if="errorMessage && !showScheduled">
          <p class="error-message">Error: {{ errorMessage }}</p>
        </div>
        <v-btn color="indigo" @click="resetView">Restart</v-btn>
        <v-btn v-if="canSubmit" color="indigo" @click="sendObservationRequest">Submit my request!</v-btn>
      </div>
      <div v-if="showScheduled">
        <DashboardView />
      </div>
    </div>
  </section>
</template>

<style scoped>
.level-buttons-wrapper {
  margin: 1em;
  gap: 1em;
}
.level-btns {
  margin: 1em;
}
</style>
