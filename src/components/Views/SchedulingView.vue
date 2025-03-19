<script setup>
import { computed, ref } from 'vue'
import AdvancedScheduling from '../Scheduling/AdvancedScheduling.vue'
import BeginnerScheduling from '../Scheduling/BeginnerScheduling.vue'
import ScheduledObservations from '../Scheduling/ScheduledObservations.vue'
import { fetchApiCall } from '../../utils/api.js'
import { formatToUTC } from '../../utils/formatTime'

// TO DO (future): Get level depending on course completion
const level = ref('')
const observationData = ref(null)
const showScheduled = ref(false)
const operatorValue = ref('')
const displayButton = ref(false)

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
        'name': 'UserObservation',
        'proposal': observationData.value.proposal,
        'ipp_value': 1.05,
        'operator': operatorValue.value,
        'observation_type': 'NORMAL',
        'requests': requestList
      },
      successCallback: () => {
        showScheduled.value = true
      },
      failCallback: (error) => {
        console.error('Error requesting observation:', error)
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

const resetView = () => {
  level.value = ''
  observationData.value = null
  showScheduled.value = false
  operatorValue.value = ''
  displayButton.value = false
}

</script>

<template>
  <section class="section  highlight">
  <div class="container">
    <div v-if="!level && !showScheduled" class="level-buttons-wrapper">
      <h2>Submit a Request</h2>
      <p>What level are you?</p>
      <v-btn @click="level = 'beginner'" color="indigo" class="level-btns">Beginner</v-btn>
      <v-btn @click="level = 'advanced'" color="indigo" class="level-btns">Advanced</v-btn>
    </div>

    <div v-else-if="level === 'beginner' && !showScheduled">
        <BeginnerScheduling @selectionsComplete="handleUserSelections" @showButton="displayButton = $event" />
        <v-btn color="indigo" @click="resetView"> Go back to levels (rename this!)</v-btn>
        <v-btn v-if="displayButton" :disabled="!enableButton" color="indigo" @click="sendObservationRequest">Submit my request!</v-btn>
    </div>

    <div v-else-if="level === 'advanced' && !showScheduled">
      <AdvancedScheduling @selectionsComplete="handleUserSelections" />
      <v-btn color="indigo" @click="resetView"> Go back to levels </v-btn>
      <v-btn :disabled="!observationData" color="indigo" @click="sendObservationRequest">Submit my request!</v-btn>
    </div>
    <div v-if="showScheduled">
      <ScheduledObservations />
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
