<script setup>
import { computed, onMounted, defineProps } from 'vue'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'

const props = defineProps({
  requestId: {
    type: Number,
    required: true
  }
})

const obsPortalDataStore = useObsPortalDataStore()

const observationDetails = computed(() => {
  if (!obsPortalDataStore.observationDetails || !obsPortalDataStore.observationDetails.results) {
    return null
  }
  else if (obsPortalDataStore.observationDetails && obsPortalDataStore.observationDetails.results.length !== 0 && obsPortalDataStore.observationDetails.results[0].requests.length !== 0) {
    return obsPortalDataStore.observationDetails.results[0].requests
  }
  else {
    return null
  }
})

onMounted(async () => {
  const requestId = props.requestId
  await obsPortalDataStore.fetchSelectedObservationDetails(requestId)
})

</script>

<template>
    <div v-if="observationDetails">
        <h2>scheduled observation details</h2>
      <div
        v-for="(observation) in observationDetails"
        :key="observation.id">
        <div
          v-for="(config) in observation.configurations"
          :key="config.id">
          <p>Target: {{ config.target.name }}</p>
          <div
            v-for="(exposure, expIndex) in config.instrument_configs"
            :key="expIndex">
            <p>Filter: {{ exposure.optical_elements.filter }}</p>
            <p>Exposure Time: {{ exposure.exposure_time }}s</p>
            <p>Exposure Count: {{ exposure.exposure_count }}</p>
          </div>
        </div>
      </div>
      <p>Start Date: {{ observationDetails[0].windows[0].start }}</p>
      <p>End Date: {{ observationDetails[0].windows[0].end }}</p>
    </div>

    <div v-else>
      <div>
        <h1>No Observation Details Available</h1>
      </div>
    </div>
  </template>
