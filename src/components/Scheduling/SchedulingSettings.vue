<script setup>
import { ref, reactive, computed, defineProps } from 'vue'

const props = defineProps({
  showProjectField: {
    type: Boolean,
    default: true
  },
  showTitleField: {
    type: Boolean,
    default: true
  }
})

const projectName = ref('')
const targetList = ref([{ name: '', exposures: [] }])
const activeTargetIndex = ref(0)

const settings = reactive({
  filter: '',
  exposureTime: '',
  count: ''
})

// State for enabling/disabling fields
const targetEnabled = computed(() => {
  return props.showProjectField ? projectName.value.trim() !== '' : true
})

const exposureEnabled = computed(() => {
  // If showTitleField is false (beginner), exposure settings should be enabled
  return !props.showTitleField || targetList.value[activeTargetIndex.value]?.name.trim() !== ''
})

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
  targetList.value.push({ name: '', exposures: [] })
  // Set the new target as active
  activeTargetIndex.value = targetList.value.length - 1
}

// Function to display exposures for a target as a concatenated string
const formatExposures = (exposures) => {
  return exposures.map(exposure => `${exposure.filter} - ${exposure.exposureTime}s x ${exposure.count}`).join(', ')
}
</script>

<template>
  <div class="container">
    <div v-if="showProjectField" class="input-wrapper">
      <label for="project-name">Project Name:</label>
      <input id="project-name" v-model="projectName" class="scheduling-inputs" placeholder="Enter project name" />
    </div>
    <!-- Render saved targets and exposures -->
    <div v-if="targetList.length > 1">
      <div v-for="(target, index) in targetList" :key="index">
        <div v-if="index !== activeTargetIndex && target.exposures.length > 0">
          {{ target.name }}: {{ formatExposures(target.exposures) }}
        </div>
      </div>
    </div>
    <!-- Render saved exposures for the active target -->
    <div v-if="targetList[activeTargetIndex].exposures.length > 0">
      <div>
        {{ targetList[activeTargetIndex].name }}: {{ formatExposures(targetList[activeTargetIndex].exposures) }}
      </div>
    </div>
    <!-- Target input -->
    <div v-if="showTitleField" class="input-wrapper">
      <label for="target-list">Target:</label>
      <input id="target-list" v-model="targetList[activeTargetIndex].name" :disabled="!targetEnabled" class="scheduling-inputs" placeholder="Enter target" />
    </div>
    <!-- Exposure settings -->
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
    <!-- Add exposure button -->
    <v-btn @click="addExposure" color="indigo" :disabled="!addExposuresEnabled" class="add-exposure">Add Exposure</v-btn>
    <!-- Add another target button -->
    <v-btn @click="addTarget" color="indigo" :disabled="!addTargetEnabled" class="add-target">Add Another Target</v-btn>
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
