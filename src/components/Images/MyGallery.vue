<script setup>
import { computed, ref, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import { useUserDataStore } from '../../stores/userData'
import { useConfigurationStore } from '../../stores/configuration'
import { formatDate } from '../../utils/formatTime.js'
import { fetchApiCall } from '../../utils/api.js'

const sessionsStore = useSessionsStore()
const userDataStore = useUserDataStore()
const configurationStore = useConfigurationStore()

const thumbnailsMap = ref({})
const loading = ref(true)

const filteredSessions = computed(() => {
  const now = new Date()
  const cutoffTime = new Date(now.getTime() - 16 * 60 * 1000)

  const sessions = sessionsStore.sessions.results || []

  return sessions
    .filter(session => new Date(session.start) < cutoffTime)
    .sort((a, b) => new Date(b.start) - new Date(a.start))
})

const getThumbnails = async (sessionId) => {
  const token = userDataStore.authToken
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Token ${token}`
  }

  await fetchApiCall({
    url: configurationStore.thumbnailArchiveUrl + `thumbnails/?observation_id=${sessionId}&size=large`,
    method: 'GET',
    header: headers,
    successCallback: (data) => {
      if (data.results.length > 0) {
        thumbnailsMap.value[sessionId] = data.results.map(result => result.url)
      }
      loading.value = false
    },
    failCallback: console.error
  })
}

onMounted(() => {
  filteredSessions.value.forEach(session => {
    getThumbnails(session.id)
  })
})

const sessionsWithThumbnails = computed(() => {
  return filteredSessions.value.filter(session => thumbnailsMap.value[session.id] && thumbnailsMap.value[session.id].length > 0)
})
</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" class="loading"/>
  </template>
  <div class="container" v-for="obs in sessionsWithThumbnails" :key="obs.id">
    <h3>{{ formatDate(obs.start) }}</h3>
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
</template>

<style scoped>
.loading {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
