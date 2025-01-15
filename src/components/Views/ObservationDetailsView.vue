<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { formatDateTime } from '../../utils/formatTime.js'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'
import { getThumbnails } from '../../utils/thumbnailsUtils.js'

const thumbnail = ref()
const obsPortalDataStore = useObsPortalDataStore()

const observationDetails = computed(() => {
  return obsPortalDataStore.selectedConfiguration
})

onMounted(async () => {
  const thumbnailsUrl = await getThumbnails('frame_basename', observationDetails.value?.basename)
  thumbnail.value = thumbnailsUrl[0].url
})

watch(observationDetails.value && thumbnail.value)

</script>

<template>
  <template v-if="observationDetails">
    <div>
      <p>Target: {{ observationDetails.target_name }}</p>
      <p>Time: {{ formatDateTime(observationDetails.observation_day, { year: 'numeric', month: 'long', day: 'numeric' })}} at {{ formatDateTime(observationDetails.observation_date, { hour: 'numeric', minute: 'numeric' }) }}</p>
      <p>Location: {{ observationDetails.SITEID }}</p>
      <p>Exposure settings:</p>
        <p> {{ observationDetails.EXPTIME }} seconds in {{ observationDetails.FILTER }} filter</p>
      </div>
      <img :src="thumbnail" alt="Observation thumbnail" />
  </template>
</template>
