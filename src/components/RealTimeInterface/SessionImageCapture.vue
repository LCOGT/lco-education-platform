<script setup>
import { ref } from 'vue'
import AladinSkyMap from './AladinSkyMap.vue'

const exposureTime = ref('')
const exposureCount = ref('')
const selectedFilter = ref('')

</script>

<template>
    <div class="wrapper">
        <div class="aladin-container">
            <AladinSkyMap ref="aladinRef" />
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
    padding: 3em;
}
.aladin-container, .controls-container {
    flex: 1;
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
