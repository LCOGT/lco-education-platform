<script setup>
import { ref, defineEmits, defineProps, computed, watch, onMounted, onUnmounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import AladinSkyMap from './AladinSkyMap.vue'
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
  targetname: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['update:renderGallery', 'update:exposureTime', 'update:selectedFilter', 'startCaptureImages'])

const exposureTime = ref('')
const exposureCount = ref('')
const selectedFilter = ref('')
const status = ref(null)
const aladinRef = ref(null)
let pollingInterval = null
const renderThumbnail = ref(false)

const bridgeApiUrl = 'http://rti-bridge-dev.lco.gtn/command/go'
const statusApiUrl = 'http://rti-bridge-dev.lco.gtn/status'

const allFieldsFilled = computed(() => {
  const filled = exposureTime.value.trim() !== '' && exposureCount.value.trim() !== '' && selectedFilter.value.trim() !== ''
  emits('update:renderGallery', filled)
  return filled
})

function changeFov (fov) {
  if (aladinRef.value && aladinRef.value.setFov) {
    aladinRef.value.setFov(fov)
  }
}

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
    expFilter: [selectedFilter.value, selectedFilter.value, selectedFilter.value],
    expTime: [exposureTime.value, exposureTime.value, exposureTime.value],
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
    // .then(handleCaptureImages())
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

watch([exposureTime, exposureCount, selectedFilter], () => {
  emits('update:selectedFilter', selectedFilter.value)
  emits('update:exposureTime', exposureTime.value)
  emits('update:renderGallery', allFieldsFilled.value)
})

function handleCaptureImages () {
  if (allFieldsFilled.value) {
    emits('startCaptureImages', true)
  }
}

</script>

<template>
    <div class="columns">
        <div class="column is-half">
            <AladinSkyMap ref="aladinRef" :targetname="targetname"/>
            <div class="mosaic-wrapper">
                <p>Mosaic</p>
                <div class="text-wrapper mosaic">
                    <span class="icon-text">
                        <span class="icon">
                            <FontAwesomeIcon icon="fa-solid fa-square" @click="changeFov(1.0)" />
                        </span>
                        <span>Single</span>
                    </span>
                </div>
                <div class="text-wrapper mosaic">
                    <span class="icon-text">
                    <span class="icon">
                        <FontAwesomeIcon icon="fa-solid fa-th-large" @click="changeFov(2.0)"  />
                    </span>
                    <span>2 x 2 mosaic</span>
                    </span>
                </div>
            </div>
        </div>
        <div class="column">
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Exposure Time</label>
                </div>
                <div class="field-body">
                    <div class="field">
                    <p class="control is-expanded">
                        <input id="exposureTime" type="text" class="input" v-model="exposureTime">
                    </p>
                    </div>
                </div>
            </div>
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Exposure Count</label>
                </div>
                <div class="field-body">
                    <div class="field">
                    <p class="control is-expanded">
                        <input id="exposureCount" type="text" class="input" v-model="exposureCount">
                    </p>
                    </div>
                </div>
            </div>
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label">Filter</label>
                </div>
                <div class="field-body">
                    <div class="field is-narrow">
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select id="filter" v-model="selectedFilter">
                                <option disabled value="">Choose a filter</option>
                                <option value="ip">RGB color</option>
                                <option value="rp">Blue</option>
                                <option value="gb">Green (V)</option>
                                <option value="Red">Red</option>
                                <option value="H-Alpha">H-Alpha</option>
                            </select>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            <div v-if="status">
                <div v-for="item in status" :key="item">
                    <p>Observatory: {{ item.availability }}</p>
                    <p>Telescope: {{ item.telescope }}</p>
                    <p>Camera: {{ item.instrument }}</p>
                    <p>Progress: {{ item.progress }}</p>
                </div>
            </div>
            <v-btn class="go-button" color="indigo" @click="commandGo" :disabled="!allFieldsFilled">Capture Target</v-btn>
            <div v-if="renderThumbnail">
                <PolledThumbnails />
            </div>
        </div>
    </div>
</template>

<style scoped>
p.mosaic {
    cursor: default;
    font-size: 1.5em;
}

.icon {
    cursor: pointer;
}
</style>
