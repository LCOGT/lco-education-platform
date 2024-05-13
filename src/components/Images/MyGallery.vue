<script setup>
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'
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
        <h3>{{ obs.date }}</h3>
        <div class="columns is-multiline">
            <div class="column is-one-quarter-desktop is-half-tablet" v-for="n in obs.num" :key="n">
            <figure class="image is-square">
                <img :src="thumbnail" class="thumbnail" />
            </figure>
        </div>
    </div>
    </div>
</template>
