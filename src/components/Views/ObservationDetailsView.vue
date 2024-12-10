<script setup>
import { computed, ref, onMounted } from 'vue'
import { formatDate, formatTime } from '../../utils/formatTime.js'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'
import { getThumbnails } from '../../utils/thumbnailsUtils.js'

const thumbnailsUrl = ref([])
const obsPortalDataStore = useObsPortalDataStore()

const observationDetails = computed(() => {
  return obsPortalDataStore.selectedConfiguration
})

onMounted(async () => {
  if (observationDetails.value?.basename) {
    thumbnailsUrl.value = await getThumbnails('frame_basename', observationDetails.value.basename)
  }
})

</script>

<template>
  <template v-if="observationDetails">
    <h3>Observation Details</h3>
    <div>
      <p>Target: {{ observationDetails.OBJECT }}</p>
      <p>Time: {{ formatDate(observationDetails.observation_day)}} at {{ formatTime(observationDetails.observation_date) }}</p>
      <p>Location: {{ observationDetails.SITEID }}</p>
      <p>Exposure settings:</p>
        <p> {{ observationDetails.EXPTIME }} seconds in {{ observationDetails.FILTER }} filter</p>
      </div>
      <img :src="thumbnailsUrl" alt="Observation thumbnail" />
  </template>
</template>
