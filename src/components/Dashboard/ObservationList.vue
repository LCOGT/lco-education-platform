<script setup>
import { formatDateMMDDYY } from '../../utils/formatTime.js'

const props = defineProps({
  observations: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  onSelect: {
    type: Function,
    required: true
  }
})

</script>

<template>
  <div class="bookings" v-if="observations.length">
    <h3>{{ title }}</h3>
    <div class="table-summary">
      <div v-for="observation in observations" :key="observation.id">
            <div v-for="configuration in observation" :key="configuration.id">
              <a @click.prevent="onSelect(configuration)"><p>{{ configuration.OBJECT.toUpperCase() }} - {{ formatDateMMDDYY(configuration.observation_date, ) }}</p></a>
            </div>
      </div>
    </div>
  </div>
</template>
