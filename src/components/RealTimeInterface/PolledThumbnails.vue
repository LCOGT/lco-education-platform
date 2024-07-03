<script setup>
import { ref, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'

const sessionsStore = useSessionsStore()
const currentSession = sessionsStore.currentSession
const sessionId = currentSession.id

const thumbnails = ref([])

let pollingInterval = null

const thumbnailsApiUrl = `http://archive-api-dev.lco.gtn/thumbnails/?observation_id=${sessionId}&size=large`

function getThumbnails () {
  fetch(thumbnailsApiUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      thumbnails.value = data.results.map(result => result.url)
    })
    .catch(error => {
      console.error('Error:', error)
    })
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
