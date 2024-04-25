<template>
  <div id="aladin-lite-div" style="width: 400px; height: 400px;"></div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Initialize Aladin Lite in the onMounted lifecycle hook
  const aladin = A.aladin('#aladin-lite-div', {
    survey: 'P/DSS2/color',
    showFullscreenControl: true,
    showLayersControl: true,
    showGotoControl: true,
    fov: 60 // field of view in degrees
  })

  // You can add additional code here to configure Aladin as needed,
  // for example, to set up event listeners or to interact with the Aladin instance programmatically.
})
</script>
