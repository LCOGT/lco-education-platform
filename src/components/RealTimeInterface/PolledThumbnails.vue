<script setup>
import { ref, onMounted } from 'vue'
import { useSessionsStore } from '../../stores/sessions'

const sessionsStore = useSessionsStore()
const currentSession = sessionsStore.currentSession
const sessionId = currentSession.id

const thumbnails = ref([])

let pollingInterval = null
const randomNumber = ref(0)

const thumbnailsApiUrl = `http://archive-api-dev.lco.gtn/thumbnails/?observation_id=${sessionId}&size=large`

function getThumbnails () {
  fetch(thumbnailsApiUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      thumbnails.value = data.results.map(result => result.url)
      randomNumber.value = Math.floor(Math.random() * thumbnails.value.length)
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

onMounted(() => {
  console.log('here', sessionId)
  getThumbnails()
  pollingInterval = setInterval(getThumbnails, 3000)
})

</script>

<template>
    <div>
<img :src="thumbnails[randomNumber]" />
</div>
</template>
