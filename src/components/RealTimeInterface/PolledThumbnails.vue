<script setup>
import { ref, onMounted } from 'vue'

const thumbnails = ref([])

let pollingInterval = null

const thumbnailsApiUrl = 'http://archive-api-dev.lco.gtn/thumbnails/?frame_basename=&proposal_id=&observation_id=617904267&request_id=&size=large'

function getThumbnails () {
  console.log('here')
  fetch(thumbnailsApiUrl)
    .then(response => response.json())
    .then(data => {
      console.log('this is data', data)
      thumbnails.value = data.results.map(result => result.url)
      console.log('this is thumbnails', thumbnails.value)
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

onMounted(() => {
  getThumbnails()
  pollingInterval = setInterval(getThumbnails, 5000)
})

</script>

<template>
    <div>
<img :src="thumbnails[0]" />
</div>
</template>
