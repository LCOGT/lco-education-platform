<script setup>
import { ref, onMounted } from 'vue'

const thumbnails = ref([])

let pollingInterval = null
const randomNumber = ref(0)

const thumbnailsApiUrl = 'http://archive-api-dev.lco.gtn/thumbnails/?frame_basename=&proposal_id=&observation_id=617904267&request_id=&size=large'

function getThumbnails () {
  fetch(thumbnailsApiUrl)
    .then(response => response.json())
    .then(data => {
      thumbnails.value = data.results.map(result => result.url)
      randomNumber.value = Math.floor(Math.random() * thumbnails.value.length)
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
<img :src="thumbnails[randomNumber]" />
</div>
</template>
