<script setup>
import { ref } from 'vue'

const objectSelection = ref('')
const objectSelected = ref(false)
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
      { object: 'Moon', targets: [{ name: 'Moon', type: 'natural' }] },
      { object: 'Jupiter', targets: [{ name: 'Jupiter', type: 'planet' }] },
      { object: 'Saturn', targets: [{ name: 'Saturn', type: 'planet' }] },
      { object: 'Mars', targets: [{ name: 'Mars', type: 'planet' }] },
      { object: 'Asteroid', targets: [{ name: 'Ceres', type: 'dwarf' }, { name: 'Vesta', type: 'dwarf' }, { name: 'Pallas', type: 'dwarf' }] },
      { object: 'Comet', targets: [{ name: 'Halley\'s Comet', type: 'short-period' }, { name: 'Comet Hale-Bopp', type: 'long-period' }, { name: 'Comet 67P', type: 'short-period' }] }
    ]
  }
])
</script>

<template>
    <div v-if="!objectSelected">
      <h2>Photon Ranch Schedule Observations</h2>
      <div v-for="category in categories" :key="category.location">
        <h3>{{ category.location }}</h3>
        <div v-for="option in category.options" :key="option.object">
          <v-btn @click="handleObjectSelection(option)">{{ option.object }}</v-btn>
        </div>
      </div>
    </div>
    <div v-if="objectSelected">
        <h3>Scheduling Observations of a {{ objectSelection.object }}</h3>
        <div v-for="target in objectSelection.targets" :key="target.name">
            <v-btn>{{ target.name }} - {{ target.type }}</v-btn>
        </div>
        <v-btn @click="handleObjectSelection(null)">Different targets</v-btn>
    </div>
</template>

<style scoped>
p, h2, h3 {
    color: red;
}
</style>
