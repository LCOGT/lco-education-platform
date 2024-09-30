<script setup>
import { ref, defineEmits, reactive, computed } from 'vue'
import ExposureSettings from './ExposureSettings.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Calendar from './Calendar.vue'
import { fetchApiCall } from '../../utils/api.js'

const emits = defineEmits(['scheduled'])

const categories = ref([
  {
    location: 'Deep Space',
    options: [
      { object: 'Galaxy' },
      { object: 'Star Cluster' },
      { object: 'Supernova' },
      { object: 'Nebula' }
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
const dateRange = ref()
const objectSelection = ref('')
const objectSelected = ref(false)
const targetSelection = ref('')
const targetSelected = ref(false)
const exposureSettings = reactive([])
const addingNewSettings = ref(false)
const loading = ref(false)
const selectedTargets = ref([])

const handleObjectSelection = (option) => {
  objectSelection.value = option
  objectSelected.value = true

  const categoryRegex = objectCategories.find(cat => cat.label === option.object)?.value

  if (!categoryRegex) {
    return
  }

  const filteredTargets = selectedTargets.value.filter(
    target => target.avmdesc.match(categoryRegex)
  ).slice(0, 3)

  // Populate the targets for the selected object
  objectSelection.value.targets = filteredTargets.map(target => ({
    name: target.name,
    desc: target.desc,
    filters: target.filters
  }))
}

const handleTargetSelection = (target) => {
  targetSelection.value = target
  targetSelected.value = true
  exposureSettings.splice(0)
  target.filters.forEach(filter => {
    exposureSettings.push({
      filter: filter.name,
      exposureTime: filter.exposure,
      saved: true,
      editing: false
    })
  })
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

// List of avmdesc categories that the user can select
const objectCategories = [
  { label: 'Star Cluster', value: /cluster|Cluster of Stars/i },
  { label: 'Supernova', value: /supernov/i },
  { label: 'Galaxy', value: /galax/i },
  { label: 'Nebula', value: /nebul/i }
]

const saveTargets = (response) => {
  const allTargets = response.targets
  const filteredTargetsByCategory = {}

  objectCategories.forEach((category) => {
    const filteredTargets = allTargets
      .filter(target => target.avmdesc.match(category.value))
      .slice(0, 3)

    if (filteredTargets.length) {
      filteredTargetsByCategory[category.label] = filteredTargets
    }
  })

  selectedTargets.value = response.targets
  const deepSpaceCategory = categories.value.find(category => category.location === 'Deep Space')

  if (deepSpaceCategory) {
    deepSpaceCategory.options = Object.keys(filteredTargetsByCategory).map((label) => {
      return {
        object: label,
        targets: filteredTargetsByCategory[label].map(target => ({
          name: target.name,
          ra: target.ra,
          dec: target.dec,
          desc: target.desc,
          filters: target.filters
        }))
      }
    })
  }

  loading.value = false
}

const fetchTargets = async (startDate, endDate) => {
  loading.value = true
  await fetchApiCall({
    url: `https://whatsup.lco.global/range/?start=${startDate}T22:00:00&end=${endDate}T22:00:00&aperture=0m4&mode=full`,
    method: 'GET',
    successCallback: saveTargets,
    failCallback: (error) => {
      console.error('Error fetching targets:', error)
    }
  })
}

const handleDateRangeUpdate = (newDateRange) => {
  dateRange.value = newDateRange
  const startDate = newDateRange[0].toISOString().split('T')[0]
  const endDate = newDateRange[1].toISOString().split('T')[0]
  fetchTargets(startDate, endDate)
}

const resetSelections = () => {
  objectSelection.value = ''
  objectSelected.value = false
  targetSelection.value = ''
  targetSelected.value = false
}

</script>

<template>
  <template v-if="loading">
    <v-progress-circular indeterminate color="white" class="loading"/>
  </template>
  <div class="container">
    <div v-if="!dateRange">
    <Calendar @updateDateRange="handleDateRangeUpdate"/>
  </div>
    <div v-if="!objectSelected && dateRange && !loading" class="content">
      <h2>Schedule an Observation</h2>
      <p>What do you want to take pictures of?</p>
      <div v-for="category in categories" :key="category.location" class="content">
        <h4>{{ category.location }}</h4>
        <div class="buttons">
          <button
            v-for="option in category.options"
            :key="option.object"
            @click="handleObjectSelection(option)"
            class="button"
          >
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
            {{ target.desc }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <button class="button" @click="resetSelections">Different targets</button>
</div>
<div v-if="targetSelected || (objectSelected && !objectSelection.targets)" class="content">
  <h2>
    Scheduling observation of
    <span v-if="objectSelection.targets"> a </span>
    <span class="selection blue">{{ objectSelection.object }}
      <span v-if="objectSelection.targets"> - {{ targetSelection.name }}</span>
    </span>
  </h2>
  <p>How do you want to set up your observation?</p>
  <div class="field is-grouped">
    <p class="control">
      <button class="button" @click="beginner = false">Let Me Choose</button>
    </p>
    <p class="control">
      <button class="button" @click="beginner = true">I'm OK with Defaults</button>
    </p>
  </div>
  <button class="button" @click="resetSelections">Different targets</button>
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
          <ul>
            <li>{{ exposureSettings.length }} color images</li>
            <li v-for="(setting, index) in exposureSettings" :key="index">
              {{ setting.exposureTime }}s with {{ setting.filter }} filter
            </li>
          </ul>
        </span>
      </span>
    </div>
  </div>
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

<style scoped>
.loading {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
