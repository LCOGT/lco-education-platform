<script setup>
import { ref, defineProps, onMounted, onUnmounted } from 'vue'
import PolledThumbnails from './PolledThumbnails.vue'

const props = defineProps({
  ra: {
    type: Number,
    required: true
  },
  dec: {
    type: Number,
    required: true
  },
  exposureCount: {
    type: Number,
    required: true
  },
  selectedFilter: {
    type: String,
    required: true
  },
  exposureTime: {
    type: Number,
    required: true
  },
  targetName: {
    type: String,
    required: true
  },
  fieldOfView: {
    type: Number,
    required: true
  }
})

const status = ref(null)
const renderThumbnail = ref(false)
let pollingInterval = null

const bridgeApiUrl = 'http://rti-bridge-dev.lco.gtn/command/go'
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

function commandGo () {
  const requestBody = {
    dec: props.dec,
    expFilter: [props.selectedFilter, props.selectedFilter, props.selectedFilter],
    expTime: [props.exposureTime, props.exposureTime, props.exposureTime],
    name: 'test',
    ra: props.ra
  }

  fetch(bridgeApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
    .then(response => {
      console.log('response', response)
      if (response.ok) {
        renderThumbnail.value = true
      }
    })
    .catch(error => {
      console.log('error', error)
    })
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
            <v-btn class="go-button" color="indigo" @click="commandGo">Capture {{ props.targetName }}</v-btn>
            <div v-if="renderThumbnail">
                <PolledThumbnails />
            </div>
        </div>
    </div>
</template>
