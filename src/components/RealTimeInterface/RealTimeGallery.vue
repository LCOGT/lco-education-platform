<script setup>
import { ref, onMounted, computed } from 'vue'
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'

const progressBar = ref(0)

const numberOfThumbnails = computed(() => {
  return progressBar.value / 10
})

onMounted(() => {
  const interval = setInterval(() => {
    progressBar.value += 10
    if (progressBar.value >= 100) {
      clearInterval(interval)
    }
  }, 1000)
})
</script>

<template>
    <div class="thumbnail-container">
      <img v-for="n in numberOfThumbnails" :key="n" :src="thumbnail" alt="Thumbnail" class="thumbnail" />
    </div>
    <div class="progress-wrapper">
        <p>Progress</p>
        <v-progress-linear
            v-model="progressBar"
            :value="progressBar"
            color="teal"
            bg-color="grey lighten-3"
            height="20"
            buffer-value="100"
            class="progress-bar"
        ></v-progress-linear>
    </div>
 </template>

<style scoped>
.progress-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 5em;
}
.progress-bar {
  width: 10%;
}
</style>
