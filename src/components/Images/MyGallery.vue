<script setup>
import { computed, ref, onMounted } from 'vue'
import { useObsPortalDataStore } from '../../stores/obsPortalData'
import { useConfigurationStore } from '../../stores/configuration'
import { formatDate } from '../../utils/formatTime.js'
import { fetchApiCall } from '../../utils/api.js'

const configurationStore = useConfigurationStore()
const obsPortalDataStore = useObsPortalDataStore()

const thumbnailsMap = ref({})
const loading = ref(true)

const filteredSessions = computed(() => {
  const now = new Date()
  // choosing 16 minutes because each session is 15 minutes long and this way we can show the last session once it's completed
  const sixteenMinutes = 16 * 60 * 1000
  const cutoffTime = new Date(now.getTime() - sixteenMinutes)
  // Object.values returns an array of all the values of the object
  const sessions = Object.values(obsPortalDataStore.completedObservations)
  const filtered = sessions
    .filter(session => new Date(session.start) < cutoffTime)
    .sort((a, b) => new Date(b.start) - new Date(a.start))
  return filtered
})

const getThumbnails = async (observationId) => {
  await fetchApiCall({
    url: configurationStore.thumbnailArchiveUrl + `thumbnails/?observation_id=${observationId}&size=large`,
    method: 'GET',
    successCallback: (data) => {
      if (data.results.length > 0) {
        thumbnailsMap.value[observationId] = data.results.map(result => result.url)
      }
      loading.value = false
    },
    failCallback: (error) => {
      console.error('Error fetching thumbnails for session:', observationId, error)
      loading.value = false
    }
  })
}

onMounted(() => {
  // Fetch thumbnails for all sessions in filteredSessions
  filteredSessions.value.forEach(session => {
    thumbnailsMap.value[session.id] = []
    getThumbnails(session.id)
  })
})

const sessionsWithThumbnails = computed(() => {
  if (loading.value) return []
  const sessions = filteredSessions.value.filter(session => thumbnailsMap.value[session.id] && thumbnailsMap.value[session.id].length > 0)
  return sessions
})

</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" class="loading"/>
  </template>
  <div class="container">
    <div v-for="obs in sessionsWithThumbnails" :key="obs.id">
      <h3 class="startTime">{{ formatDate(obs.start) }}</h3>
      <div class="columns is-multiline">
        <div
          class="column is-one-quarter-desktop is-half-tablet"
          v-for="(thumbnailUrl, i) in thumbnailsMap[obs.id]"
          :key="obs.id + '-' + i">
          <figure class="image is-square">
            <img :src="thumbnailUrl" class="thumbnail" />
          </figure>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-spinner {
  text-align: center;
}
</style>

<style scoped>
.loading {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
