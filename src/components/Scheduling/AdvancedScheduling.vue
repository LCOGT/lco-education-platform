<script setup>
import { ref, reactive, defineEmits } from 'vue'
import ProjectName from './ProjectName.vue'
import TargetSelection from './TargetSelection.vue'

// TO DO: Save project details to store
const projectName = ref('')
const targets = reactive([])
const addingNewTarget = ref(false)
const settings = reactive([{ filter: '', exposure: '', count: '', saved: false }])

const showNext = ref(0)

const emits = defineEmits(['scheduled'])

const showProjectName = (name) => {
  projectName.value = name
  if (showNext.value === 0) {
    showNext.value += 1
  }
}

const editProjectName = () => {
  projectName.value = ''
}
const handleTargetAdded = (newTarget) => {
  targets.push({ name: newTarget, saved: true, editing: false })
  addingNewTarget.value = false
  showNext.value = Math.max(showNext.value, 2)
}

const editTarget = (index) => {
  targets[index].editing = true
}

const saveEditedTarget = (index) => {
  targets[index].saved = true
  targets[index].editing = false
}

const addNewTarget = () => {
  addingNewTarget.value = true
}

const saveSettings = (index) => {
  const setting = settings[index]
  if (setting.filter !== 'Choose a filter' && setting.filter !== '' && setting.exposure.trim() !== '' && setting.count.trim() !== '') {
    setting.saved = true
    showNext.value += 1
  }
}

const editSettings = (index) => {
  settings[index].saved = false
}

const addNewSettings = () => {
  if (settings.length === 0 || settings[settings.length - 1].saved) {
    settings.push({ filter: '', exposure: '', count: '', saved: false })
  }
}

const scheduleObservation = () => {
  if (projectName.value && targets.every(t => t.saved) && settings.every(s => s.saved)) {
    emits('scheduled')
  }
}

</script>

<template>
  <h2>Photon Ranch Scheduling Observation</h2>
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
  <TargetSelection v-if="addingNewTarget || !targets.length && showNext >= 1" @targetAdded="handleTargetAdded" />
  <v-btn v-if="targets.length && targets[targets.length - 1].saved" :disabled="addingNewTarget || targets.some(t => t.editing === true)" @click="addNewTarget" color="indigo">Add Another Target</v-btn>
  <div v-for="(setting, index) in settings" :key="index">
    <div v-if="!setting.saved && showNext >= 2">
      <div class="input-wrapper">
        <label for="filter">Filter</label>
        <select v-model="setting.filter" class="scheduling-inputs">
          <option disabled value="">Choose a filter</option>
          <option value="Blue">Blue</option>
          <option value="Green (V)">Green (V)</option>
          <option value="Red">Red</option>
          <option value="H-Alpha">H-Alpha</option>
        </select>
        <input type="text" v-model="setting.exposure" placeholder="Exp time" class="scheduling-inputs">
        <input type="text" v-model="setting.count" placeholder="count" class="scheduling-inputs">
        <v-btn @click="() => saveSettings(index)" color="indigo">save</v-btn>
      </div>
    </div>
    <div v-if="setting.saved">
      <div class="input-wrapper">
        <p class="p-text">Filter: {{ setting.filter }}</p>
        <p class="p-text">Exposure: {{ setting.exposure }}</p>
        <p class="p-text">Count: {{ setting.count }}</p>
        <span class="material-icons icon" @click="() => editSettings(index)" color="indigo">edit</span>
      </div>
    </div>
</div>
  <v-btn v-if="settings[settings.length - 1].saved" @click="addNewSettings" color="indigo">Add Another Exposure</v-btn>
  <v-btn :disabled="!nameEntered || !targets || !settings.every(s => s.saved)" color="indigo" @click="scheduleObservation">Schedule my observation!</v-btn>
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
.icon {
    font-size: 1.5em;
    cursor: pointer;
}
</style>
