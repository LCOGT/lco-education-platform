<script setup>
import { computed, onMounted, defineProps } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
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
  <section class="section">
  <div class="container">
    <div v-if="observationDetails">
        <h1>scheduled observation details</h1>
      <div
        v-for="(observation) in observationDetails"
        :key="observation.id">
        <div
          v-for="(config) in observation.configurations"
          :key="config.id">
          <h2>Target: <span class="green">{{ config.target.name }}</span></h2>
          <h3>This observation is: {{ observation.state }}</h3>

          <h3><font-awesome-icon icon="fa-regular fa-camera-retro" title="Camera" /> Exposures</h3>
          <div
            v-for="(exposure, expIndex) in config.instrument_configs"
            :key="expIndex">
            <p> <font-awesome-icon icon="fa-solid fa-sliders" title="sliders" /> {{ exposure.optical_elements.filter }}
              - {{ exposure.exposure_time }}s <font-awesome-icon icon="fa-solid fa-xmark" title="times" />
             {{ exposure.exposure_count }}</p>
          </div>
        </div>
      </div>
      <h3><font-awesome-icon icon="fa-solid fa-calendar-days" title="Calendar" /> Date Window</h3>
      <p><span class="green">{{ observationDetails[0].windows[0].start }}</span> <FontAwesomeIcon icon="fa-regular fa-arrow-right"  />
      <span class="red">{{ observationDetails[0].windows[0].end }}</span></p>
    </div>

    <div v-else>
      <div>
        <h1>Problem viewing observation</h1>
        <p>There are no details available for this observation</p>
      </div>
    </div>
    </div>
  </section>
  </template>
