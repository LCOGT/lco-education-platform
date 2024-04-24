<script setup>
import { ref, computed } from 'vue';

const date = ref(null);

const bookDate = () => {
    if (date.value) {
        console.log(`Booking for: ${date.value}`);
    }
};

const formattedDate = computed(() => {
    if (date.value) {
        return `${date.value}`;
    }
    return '';
});
</script>

<template>
    <p class="date-text">Select a date and time:</p>
    <div class="datepicker">
      <v-date-picker color="indigo" v-model="date"/>
    </div>
    <p v-if="date" class="selected-date">Selected for {{ formattedDate }}</p>
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
