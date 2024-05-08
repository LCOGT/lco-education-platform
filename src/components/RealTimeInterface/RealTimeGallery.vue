<script setup>
import { ref, onMounted, computed, defineEmits } from 'vue'
import thumbnail from '../../assets/TemporaryImages/thumbnail.png'

const progressBar = ref(0)
const emits = defineEmits(['updateProgress'])

const numberOfThumbnails = computed(() => {
  return Math.floor(progressBar.value / 10)
})

onMounted(() => {
  const interval = setInterval(() => {
    progressBar.value += 10
    emits('updateProgress', progressBar.value)
    if (progressBar.value >= 100) {
      clearInterval(interval)
    }
  }, 1000)
})
</script>

<template>
  <div class="columns">
    <div class="column is-three-fifths">
      <div class="grid">
        <div class="cell" v-for="n in numberOfThumbnails" :key="n">
          <transition-group name="slide-in" tag="div">
            <figure class="image">
              <img :src="thumbnail" />
            </figure>
          </transition-group>
        </div>
      </div>
    </div>
    <div class="column">
        <p class="progress">Progress</p>
        <v-progress-linear
            v-model="progressBar"
            :value="progressBar"
            color="teal"
            bg-color="grey green-bg"
            height="20"
            buffer-value="100"
            class="progress-bar"
        ></v-progress-linear>
    </div>
  </div>
</template>
