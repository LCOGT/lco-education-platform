<script setup>
import MyGallery from '../Images/MyGallery.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'

// TO DO: get images from api and sort them by
const observations = ref([
  { id: 1, date: 'May 19, 2024', telescope: 'Maui, LCO', num: 3 },
  { id: 2, date: 'April 3, 2024', telescope: 'Queue', num: 4 },
  { id: 3, date: 'March 13, 2024', telescope: 'Maui, LCO', num: 6 },
  { id: 4, date: 'March 12, 2024', telescope: 'Queue', num: 4 }
])

</script>

<template>
    <div class="container" v-for="obs in observations" :key="obs.id">
        <MyGallery />
    </div>
</template>
