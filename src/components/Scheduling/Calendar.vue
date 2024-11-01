<script setup>
import { ref, watch, defineEmits } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const emits = defineEmits(['updateDateRange'])

// here's the documentation for vuedatepicker:
// https://vue3datepicker.com/props/general-configuration/
const dateRange = ref()

watch(dateRange, (newVal) => {
  emits('updateDateRange', newVal)
})

const currentDate = new Date()

</script>

<template>
    <div class="container">
        <h3>Select a Date Range</h3>
        <VueDatePicker
        v-model="dateRange"
        range
        :enable-time-picker="false"
        :min-date="new Date()"
        :max-date="new Date(currentDate.setDate(currentDate.getDate() + 15))"
        placeholder="Select Dates"
        required
        :date-range="dateRange"
        class="custom-date-picker"
        />
    </div>
</template>

<style scoped>
.custom-date-picker {
    width: 20%;
}
</style>
