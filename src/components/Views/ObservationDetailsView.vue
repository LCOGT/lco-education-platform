<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate, formatTime } from '../../utils/formatTime.js'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'

const route = useRoute()
const obsPortalDataStore = useObsPortalDataStore()

const observationId = route.params.id

const observationDetails = computed(() => {
  return obsPortalDataStore.completedObservations[observationId] || null
})
</script>

<template>
  <template v-if="observationDetails">
    <h3>Observation Details</h3>
    <div v-for="configuration in observationDetails.request.configurations" :key="configuration.id">
      <p>Target: {{ configuration.target.name }}</p>
      <p>Time: {{ formatDate(observationDetails.end)}} at {{ formatTime(observationDetails.end) }}</p>
      <p>Location: {{ observationDetails.site }}</p>
      <p>Exposure settings:</p>
      <div v-for="instrument in configuration.instrument_configs" :key="instrument">
        <p> {{ instrument.exposure_count }} x {{ instrument.exposure_time }} seconds in {{ instrument.optical_elements.filter }} filter</p>
      </div>
      </div>
  </template>
</template>
