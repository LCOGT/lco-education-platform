<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
const e91Thumbnails = ref([])
const e45Thumbnails = ref([])
const displayedThumbnail = ref(null)
let pollingInterval = null
let previousThumbnailCount = null

const updateThumbnails = (results, thumbnailSize, previousThumbnails) => {
  return results
    .filter(result => result.url.includes(`${thumbnailSize}-large_thumbnail`))
    .map((result, index) => {
      const previousThumbnail = previousThumbnails[index]

      return previousThumbnail && previousThumbnail.key === result.key
        ? previousThumbnail
        : {
            key: result.key,
            url: result.url
          }
    })
}

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
      const previousE91Thumbnails = e91Thumbnails.value
      const previousE45Thumbnails = e45Thumbnails.value
      e91Thumbnails.value = updateThumbnails(data.results, 'e91', e91Thumbnails.value)
      e45Thumbnails.value = updateThumbnails(data.results, 'e45', e45Thumbnails.value)
      const thumbnailCount = Math.max(e91Thumbnails.value.length, e45Thumbnails.value.length)
      const nextThumbnails = Array.from({ length: thumbnailCount }, (_, index) => {
        return e91Thumbnails.value[index] || e45Thumbnails.value[index]
      })

      thumbnails.value = nextThumbnails

      const changedThumbnails = [
        ...e91Thumbnails.value.filter((thumbnail, index) => thumbnail.key !== previousE91Thumbnails[index]?.key),
        ...e45Thumbnails.value.filter((thumbnail, index) => thumbnail.key !== previousE45Thumbnails[index]?.key)
      ]
      if (changedThumbnails.length > 0) {
        displayedThumbnail.value = changedThumbnails[changedThumbnails.length - 1]
      }

      if (previousThumbnailCount !== nextThumbnails.length) {
        previousThumbnailCount = nextThumbnails.length
        emits('thumbnailsFetched', nextThumbnails.length)
      }
    },
    failCallback: console.error
  })
}

onMounted(() => {
  getThumbnails()
  const intervalMs = configurationStore.demo ? 15000 : 1000
  pollingInterval = setInterval(getThumbnails, intervalMs)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
})

</script>

<template>
    <div>
      <img :key="displayedThumbnail?.key" :src="displayedThumbnail?.url" />
    </div>
</template>
