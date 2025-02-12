<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { formatDateTime } from '../../utils/formatTime.js'
import { useObsPortalDataStore } from '../../stores/obsPortalData.js'

const thumbnail = ref()
const obsPortalDataStore = useObsPortalDataStore()

const observationDetails = computed(() => {
  return obsPortalDataStore.selectedConfiguration
})

onMounted(async () => {
  thumbnail.value = obsPortalDataStore.thumbnails
  console.log('thumbnail', thumbnail.value)
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
