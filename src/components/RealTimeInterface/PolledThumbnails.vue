<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { useRealTimeSessionsStore } from '../../stores/realTimeSessions'
import { fetchApiCall } from '../../utils/api'
import { useConfigurationStore } from '../../stores/configuration'

const realTimeSessionsStore = useRealTimeSessionsStore()
const currentSession = realTimeSessionsStore.currentSession
const configurationStore = useConfigurationStore()

const sessionId = currentSession.id

const emits = defineEmits(['thumbnailsFetched'])

// make this into a carousel (future)
const thumbnails = ref([])
let pollingInterval = null

const getThumbnails = async () => {
  await fetchApiCall({
    url: configurationStore.thumbnailArchiveUrl + `thumbnails/?observation_id=${sessionId}&size=large`,
    method: 'GET',
    successCallback: (data) => {
      thumbnails.value = data.results.map(result => result.url)
      if (thumbnails.value.length > 0) {
        emits('thumbnailsFetched', thumbnails.value.length)
      }
    },
    failCallback: console.error
  })
}

onMounted(() => {
  getThumbnails()
  pollingInterval = setInterval(getThumbnails, 3000)
})

</script>

<template>
    <div>
      <img :src="thumbnails[0]" />
    </div>
</template>
