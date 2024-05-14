<script setup>
import { ref, defineEmits, reactive, computed } from 'vue'
import ExposureSettings from './ExposureSettings.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const emits = defineEmits(['scheduled'])

// TO DO: Save selections to store
const categories = ref([
  {
    location: 'Deep Space',
    options: [
      { object: 'Galaxy', targets: [{ name: 'Andromeda', type: 'spiral' }, { name: 'Milky Way', type: 'spiral' }, { name: 'Messier 87', type: 'elliptical' }] },
      { object: 'Star Cluster', targets: [{ name: 'Pleiades', type: 'open' }, { name: 'Hyades', type: 'open' }, { name: 'Messier 67', type: 'open' }] },
      { object: 'Supernova', targets: [{ name: 'Crab Nebula', type: 'supernova' }, { name: 'Tycho\'s Supernova', type: 'supernova' }, { name: 'SN 1054', type: 'supernova' }] },
      { object: 'Nebula', targets: [{ name: 'Orion Nebula', type: 'emission' }, { name: 'Crab Nebula', type: 'supernova' }, { name: 'Eagle Nebula', type: 'emission' }] }
    ]
  },
  {
    location: 'Our Solar System',
    options: [
      { object: 'The Moon', type: 'natural' },
      { object: 'Jupiter', type: 'planet' },
      { object: 'Saturn', type: 'planet' },
      { object: 'Mars', type: 'planet' },
      { object: 'Ceres', type: 'dwarf' },
      { object: 'Halley\'s Comet', type: 'short-period' }
    ]
  }
])

const beginner = ref()

const objectSelection = ref('')
const objectSelected = ref(false)

const targetSelection = ref('')
const targetSelected = ref(false)

const exposureSettings = reactive([])
const addingNewSettings = ref(false)

const handleObjectSelection = (option) => {
  if (option) {
    objectSelection.value = option
    objectSelected.value = true
    if (!option.targets) {
      targetSelected.value = true
      targetSelection.value = option
    } else {
      targetSelected.value = false
      targetSelection.value = null
    }
  } else {
    objectSelection.value = null
    objectSelected.value = false
    targetSelected.value = false
    targetSelection.value = null
  }
}

const handleTargetSelection = (target) => {
  targetSelection.value = target
  targetSelected.value = true
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

const disableButton = computed(() => {
  return !exposureSettings.length || !exposureSettings.every(s => s.saved) || addingNewSettings.value
})

const scheduleObservation = () => {
  if (objectSelected.value && (targetSelected.value || !objectSelection.value.targets)) {
    emits('scheduled')
  }
}

</script>

<template>
  <div class="container">
    <div v-if="!objectSelected" class="content">
      <h2>Schedule an Observation</h2>
      <p>What do you want to take pictures of?</p>
      <div v-for="category in categories" :key="category.location" class="content">
        <h4>{{ category.location }}</h4>
        <div class="buttons">
          <button v-for="option in category.options" :key="option.object" @click="handleObjectSelection(option)" class="button">
            {{ option.object }}
            </button>
        </div>
      </div>
    </div>
    <div v-if="objectSelected && !targetSelected && objectSelection.targets">
        <h3>Scheduling Observation of a <span class="blue">{{ objectSelection.object }}</span></h3>
            <div class="columns is-column-gap-3">
              <div v-for="target in objectSelection.targets" :key="target.name" @click="handleTargetSelection(target)" class="column">
              <div class="card target-highlight is-clickable">
              <header class="card-header">
                <p class="card-header-title">{{ target.name }}</p>
              </header>
              <div class="card-content">
                <div class="content">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec
                  iaculis mauris.
                </div>
              </div>
            </div>
            </div>
            </div>
        <button class="button" @click="handleObjectSelection(null)">Different targets</button>
    </div>
    <div v-if="targetSelected || (objectSelected && !objectSelection.targets)" class="content">
        <h2>Scheduling observation of <span v-if="objectSelection.targets"> a </span> <span class="selection blue">{{ objectSelection.object }} <span v-if="objectSelection.targets"> - {{ targetSelection.name }}</span></span></h2>
        <p>How do you want to set up your observation?</p>
        <div class="field is-grouped">
          <p class="control">
            <button class="button" @click="beginner = false">Let Me Choose</button>
          </p>
          <p class="control">
            <button class="button" @click="beginner = true">I'm OK with Defaults</button>
          </p>
        </div>
    </div>
    <div v-if="beginner === true && (targetSelected || (objectSelected && !objectSelection.targets))" class="grey-bg content px-2 py-2">
        <h4>Photon Ranch will schedule this for you</h4>
        <div class="columns">
          <div class="column is-half">
            <span class="icon-text">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-gear" class="blue fa-2xl" />
              </span>
              <span>Any 0.35m telescope</span>
            </span>
            <p></p>
            <span class="icon-text">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-calendar-days" class="blue fa-2xl" />
              </span>
              <span>As soon as possible</span>
            </span>
          </div>
          <div class="column">
            <span class="icon-text">
              <span class="icon is-large">
                <FontAwesomeIcon icon="fa-solid fa-sliders" class="blue fa-2xl" />
              </span>
              <span class="icon-text-list">
                <ul><li>3 color image</li><li>120s</li><li>1 x 1 mosaic</li><li>100% zoom level</li></ul>
              </span>
            </span>
          </div>
        </div>
        <!-- <v-btn @click="handleObjectSelection(null)">Different targets</v-btn> -->
        <button class="button red-bg" @click="scheduleObservation">Schedule my observation!</button>
      </div>
    <div v-if="beginner === false && (targetSelected || (objectSelected && !objectSelection.targets))"  class="grey-bg content px-2 py-2">
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
  <ExposureSettings v-if="addingNewSettings || !exposureSettings.length" @settingsAdded="addSettings" />
  <v-btn v-if="exposureSettings.length && exposureSettings[exposureSettings.length - 1].saved" :disabled="addingNewSettings || exposureSettings.some(s => s.editing === true)" @click="addNewSettings" color="indigo">Add another exposure</v-btn>
  <v-btn :disabled="disableButton"  color="indigo" @click="scheduleObservation">Schedule my observation!</v-btn>
    </div>
  </div>
</template>
