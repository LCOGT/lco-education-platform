<script setup>
import { ref, watch, defineEmits, onMounted } from 'vue'
import { fetchSemesterData, currentSemesterEnd } from '../../utils/calendarUtils'

const emits = defineEmits(['updateDateRange'])

const dateRange = ref()
const today = new Date()

watch(dateRange, (newVal) => {
  emits('updateDateRange', newVal)
})

onMounted(async () => {
  await fetchSemesterData()
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
        :max-date="new Date(currentSemesterEnd)"
        placeholder="Select Dates"
        is-required
        />
    </div>
</template>
