<script setup>
import { onMounted, ref, defineEmits } from 'vue'

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
  <div>
    <h2>Session Not Started</h2>
    <p>You are controlling Eltham College telescope 1 in Australia</p>
    <p>Session starts in {{ countdown }}</p>
  </div>
</template>
