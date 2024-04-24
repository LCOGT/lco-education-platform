<script setup>
import { onMounted, ref } from 'vue';

const timeRemaining = ref(20);

let timeRemainingInterval;
// TO DO: Change timeRemaining to actual session time remaining
onMounted(() => {
    timeRemainingInterval = setInterval(() => {
        timeRemaining.value--;
        if (timeRemaining.value === 0) {
            clearInterval(timeRemainingInterval);
        }
    }, 1000);
});
</script>

<template>
  <div>
    <h2>Real Time Session</h2>
      <p>You are controlling Eltham College telescope 1 in Australia</p>
      <p>Time Remaining in session {{ timeRemaining }}</p>
  </div>
</template>
