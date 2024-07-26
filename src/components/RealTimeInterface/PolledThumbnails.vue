<script setup>
import { ref, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import { fetchApiCall } from '../../utils/api'
import { useConfigurationStore } from '../../stores/configuration'

const sessionsStore = useSessionsStore()
const currentSession = sessionsStore.currentSession

const configurationStore = useConfigurationStore()

const sessionId = currentSession.id

// make this into a carousel (future)
const thumbnails = ref([])
let pollingInterval = null

const getThumbnails = async () => {
  // ADD AUTH TOKEN
  await fetchApiCall({ url: configurationStore.thumbnailArchiveUrl + `thumbnails/?observation_id=${sessionId}&size=large`, method: 'GET', successCallback: (data) => { thumbnails.value = data.results.map(result => result.url) }, failCallback: console.error })
}

onMounted(() => {
  getThumbnails()
  pollingInterval = setInterval(getThumbnails, 3000)
})

</script>

<template>
    <div>
<img :src="thumbnails[thumbnails.length-1]" />
</div>
</template>
