<script setup>
// TO DO: store bookings in pinia store and fetch them here
import { useRouter } from 'vue-router';

const router = useRouter();

const redirectToRTI = () => {
    router.push('/rti');
};

</script>

<template>
<div class="wrapper">
    <v-btn variant="tonal" color="indigo" class="book-slot-button"> Book Slot </v-btn>
    <h3 class="upcoming-bookings-text">Upcoming Bookings</h3>
    <div class="bookings">
        <div class="booking">
            <p class="booking-text">Booking 1</p>
        </div>
        <div class="booking">
            <p class="booking-text">Booking 2</p>
        </div>
        </div>
        <div class="booking">
            <p class="booking-text">Booking 3</p>
        </div>
        <div class="booking">
            <p class="booking-text">Booking 4</p>
        </div>
        <div class="booking">
            <p class="booking-text">Booking 5</p>
        </div>
        <div class="booking">
            <p class="booking-text">Booking 6</p>
        </div>
        <div class="booking">
            <p class="booking-text">Booking 7</p>
        </div>
        <v-btn variant="tonal" color="indigo" class="schedule-observations-btn" @click="redirectToRTI">Schedule Observations</v-btn>
    </div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.book-slot-button {
    margin-top: 2em;
    max-width: 8em;
    margin-left: 1em;
}
.upcoming-bookings-text {
    margin-top: 1em;
    margin-left: 1em;
}
.bookings {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 50vw;
    margin-top: 1em;
}
.booking-text {
    text-align: left;
    margin-left: 1em;
}
.schedule-observations-btn {
    margin-left: 1em;
    margin-top: 3em;
}
</style>
