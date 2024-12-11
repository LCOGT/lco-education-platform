<script setup>
import { formatDateTime } from '../../utils/formatTime.js'

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
              <a @click.prevent="onSelect(configuration)"><p>{{ configuration.OBJECT.toUpperCase() }} - {{ formatDateTime(configuration.observation_date, {month: '2-digit', day: '2-digit', year: '2-digit'}) }}</p></a>
            </div>
      </div>
    </div>
  </div>
</template>
