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

let demoCounter = 0
const getThumbnails = async () => {
  if (configurationStore.demo) {
    // simulate one new thumbnail every 15s until exposureCount
    demoCounter = Math.min(demoCounter + 1, realTimeSessionsStore.exposureCount)
    thumbnails.value = Array(demoCounter).fill('')
    emits('thumbnailsFetched', demoCounter)
    return
  }
  await fetchApiCall({
    url: configurationStore.thumbnailArchiveUrl + `thumbnails/?observation_id=${sessionId}&size=large`,
    method: 'GET',
    successCallback: (data) => {
      thumbnails.value = data.results
        .filter(result => result.url.includes('e01-large_thumbnail'))
        .map(result => result.url)
      emits('thumbnailsFetched', thumbnails.value.length)
    },
    failCallback: console.error
  })
}

onMounted(() => {
  getThumbnails()
  const intervalMs = configurationStore.demo ? 15000 : 1000
  pollingInterval = setInterval(getThumbnails, intervalMs)
})

</script>

<template>
    <div>
      <img :src="thumbnails[thumbnails.length - 1]" />
    </div>
</template>
