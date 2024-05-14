<script setup>
import { ref, reactive, defineEmits, computed } from 'vue'
import ProjectName from './ProjectName.vue'
import TargetSelection from './TargetSelection.vue'
import ExposureSettings from './ExposureSettings.vue'
import TelescopeSelection from './TelescopeSelection.vue'

const emits = defineEmits(['scheduled'])

// TO DO: Save project details to store
const projectName = ref('')
const targets = reactive([])
const addingNewTarget = ref(false)
const exposureSettings = reactive([])
const addingNewSettings = ref(false)
const telescope = reactive({})

const showNext = ref(0)

const showProjectName = (name) => {
  projectName.value = name
  if (showNext.value === 0) {
    showNext.value += 1
  }
}

const editProjectName = () => {
  projectName.value = ''
}

const addTarget = (newTarget) => {
  targets.push({ name: newTarget, saved: true, editing: false })
  addingNewTarget.value = false
  showNext.value += 1
}

const editTarget = (index) => {
  targets[index].editing = true
  targets[index].saved = false
}

const saveEditedTarget = (index) => {
  targets[index].saved = true
  targets[index].editing = false
  addingNewTarget.value = false
}

const addAnotherTarget = () => {
  addingNewTarget.value = true
}

const addSettings = (newSettings) => {
  exposureSettings.push({ ...newSettings, saved: true, editing: false })
  addingNewSettings.value = false
}

const editSettings = (index) => {
  exposureSettings[index].editing = true
  exposureSettings[index].saved = false
}

const saveEditedSettings = (index) => {
  exposureSettings[index].saved = true
  exposureSettings[index].editing = false
  addingNewSettings.value = false
}

const addNewSettings = () => {
  addingNewSettings.value = true
}

const addTelescope = (telescopeSelection) => {
  telescope.value = telescopeSelection
}

const disableButton = computed(() => {
  return projectName.value === '' || !targets.length || !targets.every(t => t.saved) || addingNewTarget.value || !exposureSettings.length || !exposureSettings.every(s => s.saved) || addingNewSettings.value || !telescope.value
})

const scheduleObservation = () => {
  emits('scheduled')
}

</script>

<template>
  <h2>Schedule an Observation</h2>
  <ProjectName v-if="!projectName" @nameEntered="showProjectName" />
  <div v-if="projectName">
    <p class="p-text">Project Name: {{ projectName }}</p>
    <v-btn color="teal" @click="editProjectName">edit</v-btn>
  </div>
  <div v-for="(target, index) in targets" :key="index" class="input-wrapper">
    <p class="p-text">Target: <span v-if="!target.editing">{{ target.name }}</span></p>
    <input v-if="target.editing" v-model="target.name" class="scheduling-inputs">
    <v-btn v-if="target.editing" @click="saveEditedTarget(index)" color="indigo">Save</v-btn>
    <v-btn v-else @click="editTarget(index)" :disabled="addingNewTarget" color="teal">Edit</v-btn>
  </div>
  <TargetSelection v-if="addingNewTarget || !targets.length && showNext >= 1" @targetAdded="addTarget" />
  <v-btn v-if="targets.length" :disabled="addingNewTarget || targets.some(t => t.editing === true)" @click="addAnotherTarget" color="indigo">Add Another Target</v-btn>
  <div v-for="(setting, index) in exposureSettings" :key="index" class="input-wrapper">
    <div v-if="!setting.editing">
      <p class="p-text">Filter: {{ setting.filter }}</p>
      <p class="p-text">Exposure Time: {{ setting.exposureTime }}</p>
      <p class="p-text">Count: {{ setting.count }}</p>
      <v-btn @click="editSettings(index)" :disabled="addingNewSettings" color="teal">Edit</v-btn>
    </div>
    <select v-if="setting.editing" v-model="setting.filter" class="scheduling-inputs">
        <option disabled value="">Choose a filter</option>
        <option value="Blue">Blue</option>
        <option value="Green (V)">Green (V)</option>
        <option value="Red">Red</option>
        <option value="H-Alpha">H-Alpha</option>
      </select>
    <input v-if="setting.editing" v-model="setting.exposureTime" class="scheduling-inputs">
    <input v-if="setting.editing" v-model="setting.count" class="scheduling-inputs">
    <v-btn v-if="setting.editing" @click="saveEditedSettings(index)" color="indigo">Save</v-btn>
  </div>
  <ExposureSettings v-if="addingNewSettings || !exposureSettings.length && showNext >= 2" @settingsAdded="addSettings" />
  <v-btn v-if="exposureSettings.length && exposureSettings[exposureSettings.length - 1].saved" :disabled="addingNewSettings || exposureSettings.some(s => s.editing === true)" @click="addNewSettings" color="indigo">Add another exposure</v-btn>
  <TelescopeSelection v-if="showNext >= 2 && !telescope.value" @telescopeAdded="addTelescope"/>
  <div v-if="telescope.value">
    <p class="p-text">Telescope: {{ telescope.value.telescope }}</p>
    <p class="p-text">Between {{ telescope.value.startDate.toDateString() }} and {{ telescope.value.endDate.toDateString() }}</p>
  </div>
  <v-btn :disabled="disableButton"  color="indigo" @click="scheduleObservation">Schedule my observation!</v-btn>
</template>

<style scoped>
h2 {
  margin-top: 1em;
}
.input-wrapper {
  margin: 1em;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.p-text {
  margin-right: 1em;
  font-size: 1.2em;
  cursor: default;
}
.scheduling-inputs {
  padding: 0.5em;
  box-sizing: border-box;
  border: 1px solid gray;
  border-radius: 0.2em;
}
</style>
