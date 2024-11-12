<script setup>
import { ref, watch, defineEmits } from 'vue'

const emits = defineEmits(['updateDateRange'])

const dateRange = ref()
const today = new Date()

watch(dateRange, (newVal) => {
  emits('updateDateRange', newVal)
})

</script>

<template>
    <div class="container">
        <h3>Select a Date Range</h3>
        <VDatePicker
        v-model="dateRange"
        mode="date"
        is-range
        :min-date="today"
        placeholder="Select Dates"
        is-required
        />
    </div>
</template>
