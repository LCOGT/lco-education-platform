<script setup>
import { ref, defineEmits, computed, watch } from 'vue'
import AladinSkyMap from './AladinSkyMap.vue'

const emits = defineEmits(['update:renderGallery'])

const exposureTime = ref('')
const exposureCount = ref('')
const selectedFilter = ref('')

const aladinRef = ref(null)

// TO DO: add more conditions where we check for ranges and valid values
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

watch([exposureTime, exposureCount, selectedFilter], () => {
  emits('update:renderGallery', allFieldsFilled.value)
})

</script>

<template>
    <div class="wrapper">
        <div class="aladin-container">
            <AladinSkyMap ref="aladinRef" />
            <div class="mosaic-wrapper">
                <p class="mosaic"> Mosaic </p>
                <div class="text-wrapper">
                    <span class="material-icons-round icon" @click="changeFov(1.0)">square</span>
                    <p class="mosaic">Single shot</p>
                </div>
                <div class="text-wrapper">
                    <span class="material-icons-round icon" @click="changeFov(2.0)">grid_view</span>
                    <p class="mosaic">2 x 2 mosaic</p>
                </div>
            </div>
        </div>
        <div class="controls-container">
            <div class="input-group">
                <label for="exposureTime">Exposure Time</label>
                <input id="exposureTime" type="text" v-model="exposureTime">
            </div>
            <div class="input-group">
                <label for="exposureCount">Exposure Count</label>
                <input id="exposureCount" type="text" v-model="exposureCount">
            </div>
            <div class="input-group">
                <label for="filter">Filter</label>
                <select id="filter" v-model="selectedFilter">
                    <option disabled value="">Choose a filter</option>
                    <option value="Blue">Blue</option>
                    <option value="Green (V)">Green (V)</option>
                    <option value="Red">Red</option>
                    <option value="H-Alpha">H-Alpha</option>
                </select>
            </div>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2em 0 0 7em;
}
.aladin-container, .controls-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.mosaic-wrapper {
    display: flex;
    flex-direction: column;
    align-self:flex-start;
    margin-top: 1em;
}
.text-wrapper {
    display: flex;
    flex-direction: row;
}
p.mosaic {
    cursor: default;
    font-size: 1.5em;
}
.icon {
    font-size: 2.5em;
    cursor: pointer;
}
.input-group {
    margin-bottom: 0.625em;
    text-align: left;
}
label {
    display: block;
}
input, select {
    width: 20%;
    padding: 0.5em;
    margin-top: 0.125em;
    border: 1px solid gray;
}
@media (max-width: 1200px) {
input, select {
    width: 50%;
}
}
</style>
