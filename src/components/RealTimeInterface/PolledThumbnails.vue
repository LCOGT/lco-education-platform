<script setup>
import { ref, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'
import { fetchApiCall } from '../../utils/api'

const sessionsStore = useSessionsStore()
const currentSession = sessionsStore.currentSession

const sessionId = currentSession.id

// make this into a carousel (future)
const thumbnails = ref([])
let pollingInterval = null

const thumbnailsApiUrl = `http://archive-api-dev.lco.gtn/thumbnails/?observation_id=${sessionId}&size=large`

const getThumbnails = async () => {
  // ADD AUTH TOKEN
  await fetchApiCall({ url: thumbnailsApiUrl, method: 'GET', successCallback: (data) => { thumbnails.value = data.results.map(result => result.url) }, failCallback: console.error })
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
