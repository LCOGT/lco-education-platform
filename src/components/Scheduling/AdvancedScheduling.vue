<script setup>
import { ref, reactive, watch } from 'vue'

// TO DO: Save project details to store
const projectName = ref('')
const nameEntered = ref(false)
const targets = reactive([{ name: '', saved: false }])
const settings = reactive([{ filter: '', exposure: '', count: '', saved: false }])

const showNext = ref(0)

const saveProjectName = () => {
  if (projectName.value.trim() !== '') {
    nameEntered.value = true
    if (showNext.value === 0) {
      showNext.value += 1
    }
  }
}

const editProjectName = () => {
  nameEntered.value = false
}

const saveTarget = (index) => {
  if (targets[index].name.trim() !== '') {
    targets[index].saved = true
    showNext.value += 1
  }
}

const editTarget = (index) => {
  targets[index].saved = false
}

const addNewTarget = () => {
  if (targets.length === 0 || targets[targets.length - 1].saved) {
    targets.push({ name: '', saved: false })
  }
}

const saveSettings = (index) => {
  const setting = settings[index]
  if (setting.filter !== 'Choose a filter' && setting.exposure.trim() !== '' && setting.count.trim() !== '') {
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

</script>

<template>
  <h2>Photon Ranch Scheduling Observation</h2>
  <div class="input-wrapper" v-if="!nameEntered">
    <p class="p-text">Project Name:</p>
    <input type="text" v-model="projectName" placeholder="Enter project name" class="scheduling-inputs">
    <v-btn @click="saveProjectName" color="indigo">Save</v-btn>
  </div>
  <div v-if="nameEntered">
    <div class="input-wrapper">
      <p class="p-text">Project Name: {{ projectName }}</p>
      <span class="material-icons icon" @click="editProjectName">edit</span>
    </div>
  </div>
  <div v-for="(target, index) in targets" :key="index">
    <div class="input-wrapper" v-if="!target.saved && showNext >= 1">
      <p class="p-text">Target:</p>
      <input type="text" v-model="target.name" placeholder="Enter target" class="scheduling-inputs">
      <v-btn @click="() => saveTarget(index)" color="indigo">Save</v-btn>
    </div>
    <div v-if="target.saved">
      <div class="input-wrapper">
        <p class="p-text">Target: {{ target.name }}</p>
        <span class="material-icons icon" @click="() => editTarget(index)" color="indigo">edit</span>
      </div>
    </div>
  </div>
  <v-btn v-if="targets[targets.length - 1].saved" @click="addNewTarget" color="indigo">Add Another Target</v-btn>
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
  <v-btn :disabled="!nameEntered || !targets.every(t => t.saved) || !settings.every(s => s.saved)" color="indigo">Schedule my observation!</v-btn>
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
