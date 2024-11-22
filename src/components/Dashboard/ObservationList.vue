<script setup>
import { formatDate } from '../../utils/formatTime.js'

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
        <div>
          <a @click.prevent="onSelect(observation.id)">
            <div v-for="configuration in observation.request.configurations" :key="configuration.id">
              <p>{{ configuration.target.name.toUpperCase() }} - {{ formatDate(observation.end) }}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
