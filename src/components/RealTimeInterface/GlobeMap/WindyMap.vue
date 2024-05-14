<script setup>
import { computed } from 'vue'

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

const iframeSrc = computed(() => `https://embed.windy.com/embed2.html?lat=${props.lat}&lon=${props.lon}&zoom=7&level=surface&overlay=clouds&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&detailLat=${props.lat}&detailLon=${props.lon}&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1`)
</script>

<template>
    <div class="windy-container">
      <iframe
        style="width: 100%; height: 100%;"
        :src="iframeSrc"
        frameborder="0"
      ></iframe>
    </div>
  </template>

<style scoped>
.windy-container {
height: 80vh;
width: 100%;
}
</style>
