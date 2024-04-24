<script setup>
import { ref, computed, watch } from 'vue';

const date = ref(null);
const time = ref(null);

// Automatically format the date whenever it changes
const formattedDate = computed(() => {
    if (date.value) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.value.toLocaleDateString('en-US', options);
    }
    return null;
});

// Watch for changes in the date and reset the time if it changes
watch(date, (newDate, oldDate) => {
    if (newDate !== oldDate) {
        time.value = null;
    }
});

// Dummy data for available times
const times = ['12:00', '12:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30'];

const selectTime = (selectedTime) => {
    time.value = selectedTime;
};

const bookDate = () => {
    if (formattedDate.value) {
        console.log(`Booking for: ${formattedDate.value}`);
    }
};
</script>

<template>
    <h2>Book your real-time session</h2>
    <p class="date-text">Select a date and time:</p>
    <div class="datepicker">
      <v-date-picker color="indigo" v-model="date"/>
    </div>
    <div v-if="date && time == null" class="selected-date">
        <p>Select a time:</p>
        <v-btn-group>
            <v-btn v-for="time in times" :key="time" @click="selectTime(time)">{{ time }}</v-btn>
        </v-btn-group>
    </div>
    <p v-if="formattedDate && time" class="selected-datetime">Selected for {{ formattedDate }} at {{ time }}</p>
    <v-btn variant="tonal" color="indigo" v-if="date" @click="bookDate">Book</v-btn>
</template>

<style scoped>
.date-text, .selected-date {
    font-size: 1em;
    text-align: left;
    margin: 1em 0 1em 7em;
}
.datepicker {
    display: flex;
    flex-direction: column;
    max-width: 20%;
    margin-left: 7em;
}
</style>
