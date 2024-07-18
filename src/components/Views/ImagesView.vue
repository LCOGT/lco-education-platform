<script setup>
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'
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
        <h3>{{ obs.date }}</h3>
        <div class="columns is-multiline">
            <div class="column is-one-fifth-desktop is-half-tablet" v-for="n in obs.num" :key="n">
              <figure class="image is-square">
                  <img :src="thumbnail" class="thumbnail" />
              </figure>
            </div>
            <div class="column is-one-fifth-desktop is-half-tablet">
              <div class="button-wrapper">
                <button class="button is-ghost"  v-if="obs.num > 4">
                  <span class="icon is-small">
                    <FontAwesomeIcon icon="fa-solid fa-circle-plus" class="blue icon-highlight" />
                  </span>
                  <span>Load More</span>
                </button>
                <button class="button is-ghost">
                  <span class="icon is-small">
                    <FontAwesomeIcon icon="fa-solid fa-download" class="blue icon-highlight" />
                  </span>
                  <span>Download</span>
                </button>
                <button class="button is-ghost blue">
                  <span class="icon is-small">
                    <FontAwesomeIcon icon="fa-solid fa-pen-ruler" class="blue icon-highlight" />
                  </span>
                  <span>Open in DataLab</span>
                </button>
              </div>
            </div>
        </div>
    </div>
</template>
