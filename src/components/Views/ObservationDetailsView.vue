<script setup>
import { computed, ref, onMounted } from 'vue'
import { formatDateTime } from '../../utils/formatTime.js'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'
import { getThumbnails } from '../../utils/thumbnailsUtils.js'

const thumbnailsUrl = ref([])
const obsPortalDataStore = useObsPortalDataStore()

const observationDetails = computed(() => {
  return obsPortalDataStore.selectedConfiguration
})

onMounted(async () => {
  if (observationDetails.value?.basename) {
    console.log('observation details', observationDetails.value)
    thumbnailsUrl.value = await getThumbnails('frame_basename', observationDetails.value.basename)
  }
})

</script>

<template>
  <template v-if="observationDetails">
    <h3>Observation Details</h3>
    <div>
      <p>Target: {{ observationDetails.OBJECT }}</p>
      <p>Time: {{ formatDateTime(observationDetails.observation_day, { year: 'numeric', month: 'long', day: 'numeric' })}} at {{ formatDateTime(observationDetails.observation_date, { hour: 'numeric', minute: 'numeric' }) }}</p>
      <p>Location: {{ observationDetails.SITEID }}</p>
      <p>Exposure settings:</p>
        <p> {{ observationDetails.EXPTIME }} seconds in {{ observationDetails.FILTER }} filter</p>
      </div>
      <img :src="observationDetails.url" alt="Observation thumbnail" />
  </template>
</template>
