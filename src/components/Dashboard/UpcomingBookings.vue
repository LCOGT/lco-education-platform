<script setup>
// TO DO: store bookings in pinia store and fetch them here
</script>

<template>
<div class="wrapper">
    <div class="upcoming-bookings">
        <h3 class="upcoming-bookings-text">Upcoming Bookings</h3>
    </div>
    <div class="bookings">
        <div class="booking">
            <p class="booking-text">Booking 1</p>
        </div>
        <div class="booking">
            <p class="booking-text">Booking 2</p>
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
    </div>
</div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
}
.upcoming-bookings {
    width: 50vw;
    margin-top: 1em;
}
.bookings {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}
.booking {
    margin: 2em 0 1em 1em;
}
</style>
