<script setup>
import { ref, defineProps, onMounted, onUnmounted } from 'vue'
import PolledThumbnails from './PolledThumbnails.vue'

const props = defineProps({
  exposureTime: {
    type: Number,
    required: true
  }
})

const status = ref(null)
let pollingInterval = null
const statusApiUrl = 'http://rti-bridge-dev.lco.gtn/status'

async function fetchStatus () {
  try {
    const response = await fetch(statusApiUrl)
    const data = await response.json()
    status.value = data
  } catch (error) {
    console.error('Error:', error)
  }
}

onMounted(() => {
  fetchStatus()
  pollingInterval = setInterval(fetchStatus, 1000)
})

onUnmounted(() => {
  clearInterval(pollingInterval)
})

</script>

<template>
    <div class="columns">
        <div class="column">
            <div v-if="status">
                <div v-for="item in status" :key="item">
                    <p>Observatory: {{ item.availability }}</p>
                    <p>Telescope: {{ item.telescope }}</p>
                    <p>Camera: {{ item.instrument }}</p>
                    <p>Progress: {{ item.progress }}</p>
                </div>
            </div>
            <PolledThumbnails />
        </div>
    </div>
</template>
