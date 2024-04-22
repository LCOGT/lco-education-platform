<script setup>
import { ref } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const date = ref(null);

const bookDate = () => {
    if (date.value) {
        console.log(`Booking for: ${date.value.toLocaleString()}`);
    }
};
</script>

<template>
    <p class="date-text">Select a date and time:</p>
    <div class="datepicker">
      <Datepicker v-model="date" />
    </div>
    <p v-if="date" class="selected-date">Selected Date: {{ date.toLocaleString() }}</p>
    <v-btn variant="tonal" color="indigo" v-if="date" @click="bookDate">Book</v-btn>
</template>

<style scoped>
.date-text, .selected-date {
    font-size: 1em;
    margin-bottom: 1em;
    text-align: left;
    margin-left: 7em;
}
.datepicker {
    display: flex;
    flex-direction: column;
    max-width: 20%;
    margin-left: 7em;
}
</style>
