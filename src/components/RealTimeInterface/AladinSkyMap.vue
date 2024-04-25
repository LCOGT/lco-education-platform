<template>
  <div ref="aladinContainer" class="aladin-container"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { initializeAladin } from '../../utils/aladinUtility.js'

const aladinContainer = ref(null)

onMounted(() => {
  initializeAladin(aladinContainer.value, {
    survey: 'P/DSS2/color',
    fov: 10,
    target: 'M33',
    cooFrame: 'ICRSd',
    showFullscreenControl: false,
    showGotoControl: false,
    showSimbadPointerControl: true
  })
    .then(aladin => {
      console.log('Aladin initialized:', aladin)
    })
    .catch(error => {
      console.error('Failed to initialize Aladin:', error)
    })
})
</script>

<style scoped>
.aladin-container {
  max-width: 50%;
}
</style>
