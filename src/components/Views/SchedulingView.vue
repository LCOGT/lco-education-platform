<script setup>
import { computed, ref } from 'vue'
import AdvancedScheduling from '../Scheduling/AdvancedScheduling.vue'
import BeginnerScheduling from '../Scheduling/BeginnerScheduling.vue'
import { fetchApiCall } from '../../utils/api.js'
import { formatToUTC } from '../../utils/formatTime'
import DashboardView from './DashboardView.vue'
import { useRouter } from 'vue-router'

// TO DO (future): Get level depending on course completion
const level = ref('')
const observationData = ref(null)
const showScheduled = ref(false)
const operatorValue = ref('')
const displayButton = ref(false)
const router = useRouter()
const errorMessage = ref('')
// Used to clear error message when going back to previous display
const previousDisplay = ref(null)

const createInstrumentConfigs = (exposures) => {
  const exposuresArray = Array.isArray(exposures) ? exposures : [exposures]

  return exposuresArray.map(exposure => ({
    exposure_count: exposure.count || 1,
    exposure_time: exposure.exposureTime,
    mode: 'central30x30',
    rotator_mode: '',
    extra_params: {
      offset_ra: 0,
      offset_dec: 0,
      defocus: 0
    },
    optical_elements: {
      filter: exposure.filter
    }
  }))
}

const createRequest = (target, exposures, startDate, endDate) => ({
  'acceptability_threshold': 90,
  'configuration_repeats': 1,
  'optimization_type': 'TIME',
  'configurations': [
    {
      'type': 'EXPOSE',
      'instrument_type': '0M4-SCICAM-QHY600',
      'instrument_configs': createInstrumentConfigs(exposures),
      'acquisition_config': {
        'mode': 'OFF',
        'extra_params': {}
      },
      'guiding_config': {
        'mode': 'ON',
        'optional': true,
        'extra_params': {}
      },
      'target': {
        'name': target.name,
        'type': 'ICRS',
        'ra': Number(target.ra),
        'dec': Number(target.dec),
        'proper_motion_ra': null,
        'proper_motion_dec': null,
        'epoch': 2000,
        'parallax': null,
        'extra_params': {}
      },
      'constraints': {
        'max_airmass': 1.6,
        'min_lunar_distance': 30,
        'max_lunar_phase': 1
      }
    }
  ],
  'windows': [
    {
      'start': formatToUTC(startDate),
      'end': formatToUTC(endDate)
    }
  ],
  'location': {
    // TO DO: remove hardcoded 0m4 and get telescope classes from api --> allow user to select
    'telescope_class': '0m4'
  }
})

const getProjectName = () => {
  let targetName = ''
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
  return `${targetName}_${observationData.value.startDate.split('T')[0]}`
}

const sendObservationRequest = async () => {
  if (observationData.value) {
    const requestList = []

    // Handle single target
    if (observationData.value.target) {
      const { target, settings, startDate, endDate } = observationData.value
      requestList.push(createRequest(target, settings, startDate, endDate))
    }

    // Handle multiple targets
    if (observationData.value.targets) {
      const { targets, startDate, endDate } = observationData.value
      requestList.push(...targets.map(target => createRequest(target, target.exposures, startDate, endDate)))
    }

    if (observationData.value.target || observationData.value.targets.length === 1) {
      operatorValue.value = 'SINGLE'
    } else if (observationData.value.targets.length > 1) {
      operatorValue.value = 'MANY'
    }

    await fetchApiCall({
      url: 'https://observe.lco.global/api/requestgroups/',
      method: 'POST',
      body: {
        // There are a few different scenarios of what the user might select as a target or targets. The name of the project will be the name of the first target (regardless of how many targets there are) or if there isn't a target name,
        // then it's the first target's RA/Dec. The start date is appended in YYYY-MM-DD format to the end of the name
        'name': getProjectName(),
        'proposal': observationData.value.proposal,
        'ipp_value': 1.05,
        'operator': operatorValue.value,
        'observation_type': 'NORMAL',
        'requests': requestList
      },
      successCallback: () => {
        showScheduled.value = true
        router.push('/dashboard')
      },
      failCallback: (error) => {
        showScheduled.value = false
        errorMessage.value = error.requests
          .map(request => request.non_field_errors)
          .flat()
          .join(', ')
      }
    })
  }
}

const handleUserSelections = (data) => {
  observationData.value = data
}

const enableButton = computed(() => {
  return observationData.value && observationData.value.settings.length > 0
})
// Clears errorMessage if the new display value is less than the previous one (i.e. going back)
const handleDisplay = (display) => {
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
  displayButton.value = false
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
        <BeginnerScheduling @selectionsComplete="handleUserSelections" @showButton="displayButton = $event" />
        <v-btn color="indigo" @click="resetView"> Restart</v-btn>
        <v-btn v-if="displayButton" :disabled="!enableButton" color="indigo" @click="sendObservationRequest">Submit my request!</v-btn>
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
        <v-btn :disabled="!observationData" color="indigo" @click="sendObservationRequest">Submit my request!</v-btn>
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
