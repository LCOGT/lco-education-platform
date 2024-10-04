<script setup>
import { ref, reactive, computed } from 'vue'

const projectName = ref('')
const targetList = ref([{ name: '', exposures: [] }]) // Initialize with at least one target
const activeTargetIndex = ref(0) // To track the currently active target

const settings = reactive({
  filter: '',
  exposureTime: '',
  count: ''
})
const dateRange = ref([])

// State for enabling/disabling fields
const targetEnabled = computed(() => projectName.value.trim() !== '')
const exposureEnabled = computed(() => targetList.value[activeTargetIndex.value]?.name.trim() !== '')
const addExposuresEnabled = computed(() => settings.filter && settings.exposureTime && settings.count)
const addTargetEnabled = computed(() => targetList.value[activeTargetIndex.value]?.exposures.length > 0)

// Add a new exposure to the current target
const addExposure = () => {
  if (addExposuresEnabled.value) {
    targetList.value[activeTargetIndex.value].exposures.push({
      filter: settings.filter,
      exposureTime: settings.exposureTime,
      count: settings.count
    })
    settings.filter = ''
    settings.exposureTime = ''
    settings.count = ''
  }
}

// Add a new target with empty exposure settings
const addTarget = () => {
  targetList.value.push({ name: '', exposures: [] }) // Ensure exposures is always initialized as an empty array
  activeTargetIndex.value = targetList.value.length - 1 // Set the new target as active
}

// Function to display exposures for a target as a concatenated string
const formatExposures = (exposures) => {
  return exposures.map(exposure => `${exposure.filter} - ${exposure.exposureTime}s x ${exposure.count}`).join(', ')
}
</script>

<template>
  <div class="container">
    <!-- Project Name Input -->
    <div class="input-wrapper">
      <label for="project-name">Project Name:</label>
      <input id="project-name" v-model="projectName" class="scheduling-inputs" placeholder="Enter project name" />
    </div>

    <!-- Render All Saved Targets and Exposures -->
    <div v-if="targetList.length > 1">
      <div v-for="(target, index) in targetList" :key="index">
        <div v-if="index !== activeTargetIndex && target.exposures.length > 0">
          {{ target.name }}: {{ formatExposures(target.exposures) }}
        </div>
      </div>
    </div>

    <!-- Render Saved Exposures for the Active Target -->
    <div v-if="targetList[activeTargetIndex].exposures.length > 0">
      <div>
        {{ targetList[activeTargetIndex].name }}: {{ formatExposures(targetList[activeTargetIndex].exposures) }}
      </div>
    </div>

    <!-- Target Input -->
    <div class="input-wrapper">
      <label for="target-list">Target:</label>
      <input id="target-list" v-model="targetList[activeTargetIndex].name" :disabled="!targetEnabled" class="scheduling-inputs" placeholder="Enter target" />
    </div>

    <!-- Exposure Settings -->
    <div class="exposure-settings" :class="{ disabled: !exposureEnabled }">
      <div class="field is-horizontal">
        <label>Filter</label>
        <select v-model="settings.filter" :disabled="!exposureEnabled" class="scheduling-inputs">
          <option disabled value="">Choose a filter</option>
          <option value="Blue">Blue</option>
          <option value="Green (V)">Green (V)</option>
          <option value="Red">Red</option>
          <option value="H-Alpha">H-Alpha</option>
        </select>
      </div>

      <div class="field is-horizontal">
        <label>Exposure Time</label>
        <input type="text" v-model="settings.exposureTime" :disabled="!exposureEnabled" placeholder="Exp time" />
        <label>Count</label>
        <input type="text" v-model="settings.count" :disabled="!exposureEnabled" placeholder="Count" />
      </div>
    </div>

    <!-- Add Exposure Button -->
    <button @click="addExposure" :disabled="!addExposuresEnabled" class="add-exposure">Add Exposure</button>

    <!-- Add Another Target Button -->
    <button @click="addTarget" :disabled="!addTargetEnabled" class="add-target">Add Another Target</button>

    <!-- Date Range Input -->
    <div class="input-wrapper">
      <label for="date-range">Date Range:</label>
      <input id="date-range" v-model="dateRange" class="scheduling-inputs" placeholder="Select date range" />
    </div>

    <v-btn color="indigo" :disabled="targetList.length === 0">Schedule my observations!</v-btn>
  </div>
</template>

<style scoped>
.scheduling-inputs:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}
.disabled {
  opacity: 0.5;
}
.add-exposure, .add-target {
  margin-top: 10px;
  cursor: pointer;
}
</style>
