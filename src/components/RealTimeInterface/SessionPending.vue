<script setup>
import { onMounted, ref, defineProps, defineEmits } from 'vue'
import WindyMap from './GlobeMap/WindyMap.vue'

const props = defineProps({
  lat: {
    type: Number,
    required: true
  },
  lon: {
    type: Number,
    required: true
  }
})

const emits = defineEmits(['changeView'])

const countdown = ref(1)

let countdownInterval
// TO DO: Change countdown to actual session time
onMounted(() => {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(countdownInterval)
      emits('changeView', 'sessionstarted')
    }
  }, 1000)
})
</script>

<template>
  <div class="content">
    <h2>Session Not Started</h2>
    <p>You are controlling Eltham College telescope 1 in Australia</p>
    <p><span class="green-bg px-2 py-2">Session starts in {{ countdown }}</span></p>
    <WindyMap :lat="props.lat" :lon="props.lon"/>
  </div>
</template>
