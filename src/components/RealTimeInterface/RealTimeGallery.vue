<script setup>
import { ref, onMounted, computed } from 'vue'
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'

const progressBar = ref(0)

const numberOfThumbnails = computed(() => {
  return Math.floor(progressBar.value / 10)
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
<div class="wrapper">
    <div class="thumbnail-container">
        <transition-group name="slide-in" tag="div" class="thumbnails">
        <img v-for="n in numberOfThumbnails" :key="n" :src="thumbnail" class="thumbnail" />
        </transition-group>
    </div>
    <div class="progress-wrapper">
        <p class="progress">Progress</p>
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
</div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
}
.thumbnail-container {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
    margin-top: 3em;
}
.thumbnails {
    display: flex;
    align-items: center;
}
.thumbnail {
    width: 12em;
    margin: 1em;
    transition: transform 0.5s, opacity 0.5s;
    display: inline-block;
}
.progress-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 5em;
    margin-bottom: 5em;
}
.progress {
    margin-bottom: 1em;
}
.progress-bar {
  width: 30%;
}
.slide-in-enter-active, .slide-in-leave-active {
  transition: transform 0.5s, opacity 0.5s;
}
.slide-in-enter, .slide-in-leave-to{
  transform: translateX(50px);
  opacity: 0;
}
@media (max-width: 1200px) {
.thumbnail {
    width: 8em;
}
}
</style>
