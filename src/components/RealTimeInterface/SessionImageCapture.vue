<script setup>
import { ref } from 'vue'
import AladinSkyMap from './AladinSkyMap.vue'

const exposureTime = ref('')
const exposureCount = ref('')
const selectedFilter = ref('')

</script>

<template>
<div class="wrapper">
    <AladinSkyMap />
    <div class="options-wrapper">
        <input type="text" v-model="exposureTime" placeholder="Exposure Time">
        <input type="text" v-model="exposureCount" placeholder="Exposure Count">
        <select v-model="selectedFilter">
            <option disabled value="">Choose a filter</option>
            <option value="Blue">Blue</option>
            <option value="Green (V)">Green (V)</option>
            <option value="Red">Red</option>
            <option value="H-Alpha">H-Alpha</option>
        </select>
    </div>
</div>
</template>

<style scoped>
.wrapper {
    margin-top: 2em;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-items: space-between;
}
.options-wrapper {
    display: flex;
    flex-direction: column;
    align-items: left;
}
</style>
