<script setup>
import { ref, defineEmits, reactive, computed } from 'vue'
import ExposureSettings from './ExposureSettings.vue'

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
    <div v-if="!objectSelected">
      <h2>Photon Ranch Scheduled Observation</h2>
      <h4>what do you want to take pictures of?</h4>
      <div v-for="category in categories" :key="category.location">
        <h4>{{ category.location }}</h4>
        <div class="buttons">
          <button v-for="option in category.options" :key="option.object" @click="handleObjectSelection(option)" class="button">
            {{ option.object }}
            </button>
        </div>
      </div>
    </div>
    <div v-if="objectSelected && !targetSelected && objectSelection.targets">
        <h4>Scheduling Observation of a {{ objectSelection.object }}</h4>
        <div class="buttons">
            <button v-for="target in objectSelection.targets" :key="target.name" @click="handleTargetSelection(target)" class="button">
              {{ target.name }} - {{ target.type }}
            </button>
        </div>
        <v-btn @click="handleObjectSelection(null)">Different targets</v-btn>
    </div>
    <div v-if="targetSelected || (objectSelected && !objectSelection.targets)">
        <h2>Photon Ranch</h2>
        <h2>Scheduling observation of <span v-if="objectSelection.targets"> a </span> <span class="selection">{{ objectSelection.object }} <span v-if="objectSelection.targets"> - {{ targetSelection.name }}</span></span></h2>
        <h3>How do you want to set up your observation?</h3>
        <v-btn @click="beginner = false">let me choose</v-btn>
        <v-btn @click="beginner = true" color="indigo">i'm ok with defaults</v-btn>
    </div>
    <div v-if="beginner === true && (targetSelected || (objectSelected && !objectSelection.targets))">
        <h4>Photon Ranch will schedule this for you</h4>
        <p>Any 0.6m telescope</p>
        <p>Any time in the next 2 weeks</p>
        <p><ul><li>3 color image</li><li>120s</li><li>1 x 1 mosaic</li><li>100% zoom level</li></ul></p>
        <v-btn @click="scheduleObservation">Schedule my observation!</v-btn>
        <!-- <v-btn @click="handleObjectSelection(null)">Different targets</v-btn> -->
    </div>
    <div v-if="beginner === false && (targetSelected || (objectSelected && !objectSelection.targets))" >
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
