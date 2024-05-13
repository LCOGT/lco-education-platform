<script setup>
import { ref, defineEmits } from 'vue'

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

const objectSelection = ref('')
const objectSelected = ref(false)

const targetSelection = ref('')
const targetSelected = ref(false)

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
      <div v-for="category in categories" :key="category.location">
        <h3>{{ category.location }}</h3>
        <div class="buttons">
          <button v-for="option in category.options" :key="option.object" @click="handleObjectSelection(option)" class="button">
            {{ option.object }}
            </button>
        </div>
      </div>
    </div>
    <div v-if="objectSelected && !targetSelected && objectSelection.targets">
        <h3>Scheduling Observation of a <span class="blue">{{ objectSelection.object }}</span></h3>
        <div class="buttons">
            <button v-for="target in objectSelection.targets" :key="target.name" @click="handleTargetSelection(target)" class="button">
              {{ target.name }} - {{ target.type }}
            </button>
        </div>
        <v-btn @click="handleObjectSelection(null)">Different targets</v-btn>
    </div>
    <div v-if="targetSelected || (objectSelected && !objectSelection.targets)">
        <h2>Scheduling observation of <span v-if="objectSelection.targets"> a </span> <span class="selection blue">{{ objectSelection.object }} <span v-if="objectSelection.targets"> - {{ targetSelection.name }}</span></span></h2>
        <h4>Photon Ranch will schedule this for you</h4>
        <div class="buttons">
          <button @click="scheduleObservation" class="button">Schedule my observation!</button>
          <button @click="handleObjectSelection(null)" class="button">Different targets</button>
        </div>
    </div>
  </div>
</template>
