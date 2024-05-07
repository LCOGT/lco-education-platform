<script setup>
import { ref } from 'vue'

const objectSelection = ref('')
const objectSelected = ref(false)

const targetSelection = ref('')
const targetSelected = ref(false)

const handleObjectSelection = (option) => {
  if (option) {
    objectSelection.value = option
    objectSelected.value = true
  } else {
    objectSelection.value = null
    objectSelected.value = false
  }
}

const handleTargetSelection = (target) => {
  if (target) {
    targetSelection.value = target
    targetSelected.value = true
  } else {
    targetSelection.value = null
    targetSelected.value = false
  }
  console.log('Target selected:', targetSelected.value)
}

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
</script>

<template>
    <div v-if="!objectSelected">
      <h2>Photon Ranch Schedule Observation</h2>
      <div v-for="category in categories" :key="category.location">
        <h3>{{ category.location }}</h3>
        <div v-for="option in category.options" :key="option.object">
          <v-btn @click="() => handleObjectSelection(option)">
            {{ option.object }}
          </v-btn>
        </div>
      </div>
    </div>
    <div v-if="objectSelected && !targetSelected && objectSelection.targets">
        <h3>Scheduling Observation of a {{ objectSelection.object }}</h3>
        <h4>Choose a target</h4>
        <div v-for="target in objectSelection.targets" :key="target.name">
            <v-btn @click="handleTargetSelection(target)">{{ target.name }} - {{ target.type }}</v-btn>
        </div>
        <v-btn @click="handleObjectSelection(null)">Different targets</v-btn>
    </div>
    <div v-if="targetSelected || (objectSelected && !targetSelected && !objectSelection.targets)">
        <h3>Photon Ranch </h3>
        <h2>Scheduling observation of <span v-if="objectSelection.targets"> a </span> <span class="selection">{{ objectSelection.object }} <span v-if="objectSelection.targets"> - {{ targetSelection.name }}</span></span></h2>
        <h4>Photon Ranch will schedule this for you</h4>
        <div v-if="objectSelected && !targetSelected && !objectSelection.targets">
            <v-btn @click="handleObjectSelection(null)">Different targets</v-btn>
            <v-btn  @click="handleTargetSelection(objectSelection)">Schedule Observation</v-btn>
        </div>
        <v-btn v-if="objectSelection.targets">Schedule Observation</v-btn>
    </div>
</template>

<style scoped>
p, h2, h3, h4 {
    color: red;
}
.selection {
    color: blue;
}
</style>
